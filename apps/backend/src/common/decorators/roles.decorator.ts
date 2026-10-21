import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Array<'ADMIN' | 'OWNER' | 'TENANT' | 'TECHNICIAN' | 'USER'>) =>
  SetMetadata(ROLES_KEY, roles);
