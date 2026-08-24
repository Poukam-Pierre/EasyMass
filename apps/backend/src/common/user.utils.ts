import { ForbiddenException } from '@nestjs/common';
import { Administrator, Parish, Priest, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type UserWithRoles = User & {
  admin: Administrator | null;
  parish: Parish | null;
  priest: Priest | null;
};

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
 * issue) or isn't one of the roles this MVP supports.
 */
export function flattenUserRole(user: UserWithRoles) {
  const roleEntity =
    user.role === 'ADMIN'
      ? user.admin
      : user.role === 'PARISH'
        ? user.parish
        : user.role === 'PRIEST'
          ? user.priest
          : null;

  if (!roleEntity) return null;

  return {
    ...roleEntity,
    email: user.email,
    password: user.password,
    userId: user.userId,
    role: user.role,
  };
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
    throw new ForbiddenException('Forbidden', {
      cause: new Error(),
      description: 'Authenticated user is not a parish.',
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
    throw new ForbiddenException('Forbidden', {
      cause: new Error(),
      description: 'Authenticated user is not an administrator.',
    });
  }
  return admin;
}
