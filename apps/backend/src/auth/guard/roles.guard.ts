import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator';
import { ROLES_KEY } from '../decorator/roles.decorator';

/** Runs after AuthGuard. Fails CLOSED: a route with no @Roles() is denied
 * (matching the AdminGuard this replaced) — every authenticated route must
 * explicitly declare which roles may access it, or be marked @Public(). */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles || requiredRoles.length === 0) return false;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user?.role);
  }
}
