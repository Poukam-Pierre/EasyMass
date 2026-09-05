import { ForbiddenException } from '@nestjs/common';
import { Administrator, Parish, Priest, User, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type UserWithRoles = User & {
  admin: Administrator | null;
  parish: Parish | null;
  priest: Priest | null;
};

/** Common fields every flattened shape carries, spread from the central
 * User record on top of the role-specific entity's own fields. */
interface FlattenedCommon {
  email: string;
  password: string;
  userId: string;
}

export type FlattenedUser =
  | (Administrator & FlattenedCommon & { role: typeof UserRole.ADMIN })
  | (Parish & FlattenedCommon & { role: typeof UserRole.PARISH })
  | (Priest & FlattenedCommon & { role: typeof UserRole.PRIEST });

/**
 * Single shared lookup for "find the User account for this email, with all
 * role relations attached" — the query previously hand-duplicated across
 * AdministratorService, ParishService, and PriestService.
 */
export async function findUserByEmail(
  prisma: PrismaService,
  email: string
): Promise<UserWithRoles | null> {
  return prisma.user.findUnique({
    where: { email },
    include: { admin: true, parish: true, priest: true },
  });
}

/**
 * Picks the role-specific entity matching User.role and flattens it into
 * the shape auth/login consumers expect: role fields plus email/password/
 * userId/role from the central User record. Returns null if the user's
 * role doesn't have its corresponding relation populated (data integrity
 * issue). The return type is a discriminated union on `role`, so a caller
 * that narrows on `flattened.role` gets a properly-typed shape back instead
 * of needing to cast.
 */
export function flattenUserRole(user: UserWithRoles): FlattenedUser | null {
  const common: FlattenedCommon = {
    email: user.email,
    password: user.password,
    userId: user.userId,
  };

  switch (user.role) {
    case UserRole.ADMIN:
      return user.admin
        ? { ...user.admin, ...common, role: UserRole.ADMIN }
        : null;
    case UserRole.PARISH:
      return user.parish
        ? { ...user.parish, ...common, role: UserRole.PARISH }
        : null;
    case UserRole.PRIEST:
      return user.priest
        ? { ...user.priest, ...common, role: UserRole.PRIEST }
        : null;
    default:
      return null;
  }
}

/**
 * The JWT's `id` claim (request.user.id) is the central User.userId, not a
 * role-entity id. These resolve it to the actual Parish/Administrator row
 * for the currently authenticated caller. Throws if the caller isn't that
 * role — callers should only use the one matching the route's @Roles().
 */
export async function resolveParishForUser(
  prisma: PrismaService,
  userId: string
) {
  const parish = await prisma.parish.findUnique({ where: { userId } });
  if (!parish) {
    throw new ForbiddenException('Authenticated user is not a parish.', {
      cause: new Error(),
    });
  }
  return parish;
}

export async function resolveAdminForUser(
  prisma: PrismaService,
  userId: string
) {
  const admin = await prisma.administrator.findUnique({ where: { userId } });
  if (!admin) {
    throw new ForbiddenException('Authenticated user is not an administrator.', {
      cause: new Error(),
    });
  }
  return admin;
}
