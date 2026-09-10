import { Injectable, Inject } from '@nestjs/common';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.provider';
import * as schema from '../database/schema';
import { PropertiesService } from '../properties/properties.service';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(DRIZZLE)
    private db: any,
    private propertiesService: PropertiesService,
  ) {}

  private async getOwnerRoomIds(ownerId: string, userRole: string): Promise<string[]> {
    const properties = await this.propertiesService.findAll(ownerId, userRole);
    if (!properties || properties.length === 0) return [];

    const propertyIds = properties.map((p: any) => p.id);
    const rooms = await this.db.query.rooms.findMany({
      where: inArray(schema.rooms.propertyId, propertyIds),
    });

    return rooms.map((r: any) => r.id);
  }

  async getOverview(ownerId: string, userRole: string) {
    const properties = await this.propertiesService.findAll(ownerId, userRole);
    const propertyIds = properties.map((p: any) => p.id);

    if (propertyIds.length === 0) {
      return {
        totalProperties: 0,
        rooms: { total: 0, occupied: 0, available: 0, maintenance: 0, occupancyRate: '0%' },
        revenue: { monthlyRevenue: 0, outstanding: 0, paidCount: 0, pendingCount: 0, overdueCount: 0 },
        maintenance: { openCount: 0, inProgressCount: 0, resolvedCount: 0, closedCount: 0 },
      };
    }

    const rooms = await this.db.query.rooms.findMany({
      where: inArray(schema.rooms.propertyId, propertyIds),
    });

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r: any) => r.status === 'OCCUPIED').length;
    const availableRooms = rooms.filter((r: any) => r.status === 'AVAILABLE').length;
    const maintenanceRooms = rooms.filter((r: any) => r.status === 'MAINTENANCE').length;
    const occupancyRate = totalRooms > 0 ? `${((occupiedRooms / totalRooms) * 100).toFixed(1)}%` : '0%';

    const roomIds = rooms.map((r: any) => r.id);

    // Payments
    let monthlyRevenue = 0;
    let outstanding = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;

    if (roomIds.length > 0) {
      const payments = await this.db.query.payments.findMany({
        where: inArray(schema.payments.roomId, roomIds),
      });

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      for (const p of payments) {
        const amt = Number(p.amount) || 0;
        if (p.status === 'PAID') {
          paidCount += 1;
          const pDate = p.paidAt ? new Date(p.paidAt) : new Date(p.createdAt);
          if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
            monthlyRevenue += amt;
          }
        } else if (p.status === 'PENDING') {
          pendingCount += 1;
          outstanding += amt;
          if (new Date(p.dueDate) < now) {
            overdueCount += 1;
          }
        }
      }
    }

    // Maintenance
    let openCount = 0;
    let inProgressCount = 0;
    let resolvedCount = 0;
    let closedCount = 0;

    if (roomIds.length > 0) {
      const tickets = await this.db.query.maintenanceRequests.findMany({
        where: inArray(schema.maintenanceRequests.roomId, roomIds),
      });

      for (const t of tickets) {
        if (t.status === 'REPORTED' || t.status === 'REVIEWING' || t.status === 'ASSIGNED') {
          openCount += 1;
        } else if (t.status === 'IN_PROGRESS') {
          inProgressCount += 1;
        } else if (t.status === 'RESOLVED') {
          resolvedCount += 1;
        } else if (t.status === 'CLOSED') {
          closedCount += 1;
        }
      }
    }

    return {
      totalProperties: properties.length,
      rooms: {
        total: totalRooms,
        occupied: occupiedRooms,
        available: availableRooms,
        maintenance: maintenanceRooms,
        occupancyRate,
      },
      revenue: {
        monthlyRevenue,
        outstanding,
        paidCount,
        pendingCount,
        overdueCount,
      },
      maintenance: {
        openCount,
        inProgressCount,
        resolvedCount,
        closedCount,
      },
    };
  }

  async getRevenueMetrics(ownerId: string, userRole: string) {
    const roomIds = await this.getOwnerRoomIds(ownerId, userRole);
    if (roomIds.length === 0) {
      return { totalRevenue: 0, collectionRate: '0%', outstanding: 0, monthlyTrend: [] };
    }

    const payments = await this.db.query.payments.findMany({
      where: inArray(schema.payments.roomId, roomIds),
      orderBy: (p, { desc }) => [desc(p.createdAt)],
    });

    let totalRevenue = 0;
    let totalBilled = 0;
    let outstanding = 0;

    const monthlyMap = new Map<string, number>();

    for (const p of payments) {
      const amt = Number(p.amount) || 0;
      totalBilled += amt;

      if (p.status === 'PAID') {
        totalRevenue += amt;
        const d = p.paidAt ? new Date(p.paidAt) : new Date(p.createdAt);
        const monthKey = d.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + amt);
      } else if (p.status === 'PENDING') {
        outstanding += amt;
      }
    }

    const collectionRate =
      totalBilled > 0 ? `${((totalRevenue / totalBilled) * 100).toFixed(1)}%` : '0%';

    const monthlyTrend = Array.from(monthlyMap.entries()).map(([month, revenue]) => ({
      month,
      revenue,
    }));

    return {
      totalRevenue,
      collectionRate,
      outstanding,
      monthlyTrend,
    };
  }

  async getOccupancyMetrics(ownerId: string, userRole: string) {
    const properties = await this.propertiesService.findAll(ownerId, userRole);

    const propertyOccupancy = properties.map((prop: any) => {
      const total = prop.rooms?.length || 0;
      const occupied = prop.rooms?.filter((r: any) => r.status === 'OCCUPIED').length || 0;
      const available = prop.rooms?.filter((r: any) => r.status === 'AVAILABLE').length || 0;
      const maintenance = prop.rooms?.filter((r: any) => r.status === 'MAINTENANCE').length || 0;
      const rate = total > 0 ? `${((occupied / total) * 100).toFixed(1)}%` : '0%';

      return {
        propertyId: prop.id,
        propertyName: prop.name,
        totalRooms: total,
        occupiedRooms: occupied,
        availableRooms: available,
        maintenanceRooms: maintenance,
        occupancyRate: rate,
      };
    });

    const totalRooms = propertyOccupancy.reduce((acc, p) => acc + p.totalRooms, 0);
    const totalOccupied = propertyOccupancy.reduce((acc, p) => acc + p.occupiedRooms, 0);
    const overallRate = totalRooms > 0 ? `${((totalOccupied / totalRooms) * 100).toFixed(1)}%` : '0%';

    return {
      overallOccupancyRate: overallRate,
      totalRooms,
      totalOccupied,
      totalVacant: totalRooms - totalOccupied,
      properties: propertyOccupancy,
    };
  }

  async getMaintenanceMetrics(ownerId: string, userRole: string) {
    const roomIds = await this.getOwnerRoomIds(ownerId, userRole);
    if (roomIds.length === 0) {
      return {
        totalRequests: 0,
        totalCost: 0,
        mostCommonCategory: 'N/A',
        mostProblematicRoom: null,
        averageResolutionHours: 0,
        categories: [],
      };
    }

    const tickets = await this.db.query.maintenanceRequests.findMany({
      where: inArray(schema.maintenanceRequests.roomId, roomIds),
      with: {
        room: {
          with: {
            property: true,
          },
        },
      },
    });

    const totalRequests = tickets.length;
    let totalCost = 0;
    const categoryCount = new Map<string, number>();
    const roomProblemCount = new Map<string, { roomNumber: string; propertyName: string; count: number }>();
    let totalResolutionHours = 0;
    let resolvedCount = 0;

    for (const t of tickets) {
      if (t.actualCost) {
        totalCost += Number(t.actualCost);
      }

      // Categories
      categoryCount.set(t.category, (categoryCount.get(t.category) || 0) + 1);

      // Room tracking
      const rId = t.roomId;
      const current = roomProblemCount.get(rId) || {
        roomNumber: t.room.roomNumber,
        propertyName: t.room.property.name,
        count: 0,
      };
      current.count += 1;
      roomProblemCount.set(rId, current);

      // Resolution time
      if (t.resolvedAt && t.createdAt) {
        const hours = (new Date(t.resolvedAt).getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60);
        totalResolutionHours += Math.max(0, hours);
        resolvedCount += 1;
      }
    }

    // Most common category
    let mostCommonCategory = 'N/A';
    let maxCatCount = 0;
    for (const [cat, cnt] of categoryCount.entries()) {
      if (cnt > maxCatCount) {
        maxCatCount = cnt;
        mostCommonCategory = cat;
      }
    }

    // Most problematic room
    let mostProblematicRoom: any = null;
    let maxRoomCount = 0;
    for (const [rId, val] of roomProblemCount.entries()) {
      if (val.count > maxRoomCount) {
        maxRoomCount = val.count;
        mostProblematicRoom = {
          roomId: rId,
          roomNumber: val.roomNumber,
          propertyName: val.propertyName,
          reportsCount: val.count,
        };
      }
    }

    const averageResolutionHours =
      resolvedCount > 0 ? Math.round(totalResolutionHours / resolvedCount) : 0;

    const categories = Array.from(categoryCount.entries()).map(([category, count]) => ({
      category,
      count,
    }));

    return {
      totalRequests,
      totalCost,
      mostCommonCategory,
      mostProblematicRoom,
      averageResolutionHours,
      categories,
    };
  }
}
