import { SetMetadata } from '@nestjs/common';
import { Permission } from 'src/generated/prisma/enums';

export const RequirePermission = (permission: Permission) =>
  SetMetadata('permission', permission);
