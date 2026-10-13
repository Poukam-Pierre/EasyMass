import { UserRole } from '@prisma/client';
import { Request } from 'express';

/** Shape AuthGuard attaches to every authenticated request (see
 * auth/guard/auth.guards.ts). `user.id` is the central User.userId (JWT
 * `sub` claim), not a role-entity id — see resolveParishForUser/
 * resolveAdminForUser in user.utils.ts to get the actual Parish/
 * Administrator row. */
export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}
