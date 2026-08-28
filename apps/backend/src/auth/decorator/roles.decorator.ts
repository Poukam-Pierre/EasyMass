import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/** Restricts a route to the given account types (UserRole). Requires AuthGuard
 * to have already run (registered globally) so request.user.role is set. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
