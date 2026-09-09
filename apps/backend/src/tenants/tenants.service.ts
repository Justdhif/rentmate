import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { eq, and, inArray, desc } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.provider';
import * as schema from '../database/schema';
import { RoomsService } from '../rooms/rooms.service';
import { PropertiesService } from '../properties/properties.service';
import { UsersService } from '../users/users.service';
import { AssignRoomDto } from './dto/assign-room.dto';
import { UnassignRoomDto } from './dto/unassign-room.dto';
import { InviteTenantDto } from './dto/invite-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @Inject(DRIZZLE)
    private db: any,
    private roomsService: RoomsService,
    private propertiesService: PropertiesService,
    private usersService: UsersService,
  ) {}

  async assignRoom(
    roomId: string,
    ownerId: string,
    userRole: string,
    dto: AssignRoomDto,
  ) {
    const room = await this.roomsService.findOne(roomId, ownerId, userRole);

    if (room.status !== 'AVAILABLE') {
      throw new BadRequestException(
        `Room is not available for assignment. Current status: ${room.status}`,
      );
    }

    const tenantUser = await this.usersService.findByEmail(dto.tenantEmail);
    if (!tenantUser) {
      throw new NotFoundException(
        `No registered user found with email: ${dto.tenantEmail}. Please invite them first or ensure they register.`,
      );
    }

    if (tenantUser.role !== 'TENANT') {
      throw new BadRequestException(
        `User ${dto.tenantEmail} has role '${tenantUser.role}', only 'TENANT' can be assigned to a room.`,
      );
    }

    // Check if tenant already has an active room
    const existingActive = await this.db.query.roomAssignments.findFirst({
      where: and(
        eq(schema.roomAssignments.tenantId, tenantUser.id),
        eq(schema.roomAssignments.status, 'ACTIVE'),
      ),
    });

    if (existingActive) {
      throw new ConflictException(
        'This tenant already has an active room assignment. Unassign them from their current room first.',
      );
    }

    const monthlyRent = dto.monthlyRent !== undefined
      ? dto.monthlyRent.toString()
      : room.price;

    const [assignment] = await this.db
      .insert(schema.roomAssignments)
      .values({
        roomId,
        tenantId: tenantUser.id,
        startDate: dto.startDate,
        endDate: dto.endDate,
        monthlyRent,
        status: 'ACTIVE',
        notes: dto.notes,
      })
      .returning();

    // Update room status to OCCUPIED
    await this.db
      .update(schema.rooms)
      .set({
        status: 'OCCUPIED',
        updatedAt: new Date(),
      })
      .where(eq(schema.rooms.id, roomId));

    return {
      ...assignment,
      tenant: {
        id: tenantUser.id,
        email: tenantUser.email,
        profile: tenantUser.profile,
      },
      room: {
        id: room.id,
        roomNumber: room.roomNumber,
        floor: room.floor,
        roomType: room.roomType,
      },
    };
  }

  async unassignRoom(
    roomId: string,
    ownerId: string,
    userRole: string,
    dto: UnassignRoomDto,
  ) {
    const room = await this.roomsService.findOne(roomId, ownerId, userRole);

    const activeAssignment = await this.db.query.roomAssignments.findFirst({
      where: and(
        eq(schema.roomAssignments.roomId, roomId),
        eq(schema.roomAssignments.status, 'ACTIVE'),
      ),
      with: {
        tenant: {
          with: {
            profile: true,
          },
        },
      },
    });

    if (!activeAssignment) {
      throw new NotFoundException('No active room assignment found for this room');
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const endDate = dto.endDate || todayDate;

    const [updatedAssignment] = await this.db
      .update(schema.roomAssignments)
      .set({
        status: 'ENDED',
        endDate,
        notes: dto.notes ? dto.notes : activeAssignment.notes,
        updatedAt: new Date(),
      })
      .where(eq(schema.roomAssignments.id, activeAssignment.id))
      .returning();

    // Update room status back to AVAILABLE
    await this.db
      .update(schema.rooms)
      .set({
        status: 'AVAILABLE',
        updatedAt: new Date(),
      })
      .where(eq(schema.rooms.id, roomId));

    return {
      success: true,
      message: 'Room assignment ended successfully. Room is now AVAILABLE.',
      data: updatedAssignment,
    };
  }

  async findAllByOwner(ownerId: string, userRole: string) {
    const properties = await this.propertiesService.findAll(ownerId, userRole);
    if (!properties || properties.length === 0) {
      return [];
    }

    const propertyIds = properties.map((p: any) => p.id);

    const rooms = await this.db.query.rooms.findMany({
      where: inArray(schema.rooms.propertyId, propertyIds),
      with: {
        property: true,
        assignments: {
          with: {
            tenant: {
              with: {
                profile: true,
              },
            },
          },
          orderBy: [desc(schema.roomAssignments.createdAt)],
        },
      },
    });

    const tenantsMap = new Map<string, any>();

    for (const room of rooms) {
      for (const assignment of room.assignments) {
        const tenant = assignment.tenant;
        if (!tenant) continue;

        if (!tenantsMap.has(tenant.id)) {
          tenantsMap.set(tenant.id, {
            id: tenant.id,
            email: tenant.email,
            profile: tenant.profile,
            currentRoom:
              assignment.status === 'ACTIVE'
                ? {
                    id: room.id,
                    roomNumber: room.roomNumber,
                    propertyName: room.property.name,
                    propertyId: room.property.id,
                    monthlyRent: assignment.monthlyRent,
                    startDate: assignment.startDate,
                  }
                : null,
            totalAssignments: 1,
            lastAssignmentStatus: assignment.status,
          });
        } else {
          const record = tenantsMap.get(tenant.id);
          record.totalAssignments += 1;
          if (assignment.status === 'ACTIVE' && !record.currentRoom) {
            record.currentRoom = {
              id: room.id,
              roomNumber: room.roomNumber,
              propertyName: room.property.name,
              propertyId: room.property.id,
              monthlyRent: assignment.monthlyRent,
              startDate: assignment.startDate,
            };
          }
        }
      }
    }

    return Array.from(tenantsMap.values());
  }

  async findTenantById(tenantId: string, ownerId: string, userRole: string) {
    const tenantUser = await this.usersService.findById(tenantId);
    if (!tenantUser) {
      throw new NotFoundException('Tenant not found');
    }

    const assignments = await this.db.query.roomAssignments.findMany({
      where: eq(schema.roomAssignments.tenantId, tenantId),
      with: {
        room: {
          with: {
            property: true,
          },
        },
      },
      orderBy: [desc(schema.roomAssignments.createdAt)],
    });

    if (userRole !== 'ADMIN') {
      const isMyTenant = assignments.some(
        (a: any) => a.room?.property?.ownerId === ownerId,
      );
      if (!isMyTenant) {
        throw new ForbiddenException(
          'Access denied: This tenant is not registered to any of your properties',
        );
      }
    }

    return {
      ...tenantUser,
      assignmentHistory: assignments,
    };
  }

  async getMyRoom(tenantId: string) {
    const activeAssignment = await this.db.query.roomAssignments.findFirst({
      where: and(
        eq(schema.roomAssignments.tenantId, tenantId),
        eq(schema.roomAssignments.status, 'ACTIVE'),
      ),
      with: {
        room: {
          with: {
            property: {
              with: {
                facilities: true,
                owner: {
                  with: {
                    profile: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!activeAssignment) {
      return {
        hasActiveRoom: false,
        message: 'You currently have no active room assignment',
      };
    }

    const prop = activeAssignment.room.property;
    const ownerProfile = prop.owner?.profile;

    return {
      hasActiveRoom: true,
      assignment: {
        id: activeAssignment.id,
        startDate: activeAssignment.startDate,
        endDate: activeAssignment.endDate,
        monthlyRent: activeAssignment.monthlyRent,
        status: activeAssignment.status,
      },
      room: {
        id: activeAssignment.room.id,
        roomNumber: activeAssignment.room.roomNumber,
        floor: activeAssignment.room.floor,
        roomType: activeAssignment.room.roomType,
        facilities: activeAssignment.room.facilities,
        photos: activeAssignment.room.photos,
        description: activeAssignment.room.description,
      },
      property: {
        id: prop.id,
        name: prop.name,
        address: prop.address,
        rules: prop.rules,
        contactInfo: prop.contactInfo,
        facilities: prop.facilities?.map((f: any) => f.name) || [],
        photos: prop.photos,
        owner: {
          name: ownerProfile?.fullName || 'Owner',
          phone: ownerProfile?.phoneNumber || prop.contactInfo,
        },
      },
    };
  }

  async inviteTenant(ownerId: string, userRole: string, dto: InviteTenantDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      return {
        success: true,
        isRegistered: true,
        message: 'Tenant already has an active RentMate account',
        user: {
          id: existing.id,
          email: existing.email,
          role: existing.role,
        },
      };
    }

    return {
      success: true,
      isRegistered: false,
      message:
        'Invitation link generated. Tenant can register using this email and will be linked to your property.',
      inviteDetails: {
        email: dto.email,
        fullName: dto.fullName,
        roomId: dto.roomId,
      },
    };
  }
}
