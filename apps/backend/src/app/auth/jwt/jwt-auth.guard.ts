import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { MetadataEnum } from '../auth.decorator';
import { Request } from 'express';
import { Role, User } from '@prisma/client';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      MetadataEnum.IS_PUBLIC,
      [context.getHandler(), context.getClass()],
    );

    // Special case: Allow priest signup without token
    const isPriestSignup =
      request.url.includes('auth/sign-up') &&
      request.body?.role === Role.PRIEST &&
      !request.headers.authorization;

    if (isPublic || isPriestSignup) return isPriestSignup || isPublic;

    return super.canActivate(context);
  }

  handleRequest<TUser = User>(
    err: unknown,
    user: User,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (err || info) {
      throw err || new ForbiddenException('Invalid bearer token!');
    }

    const request = context.switchToHttp().getRequest<Request>();
    const requiredRole = this.reflector.getAllAndOverride<Role[]>(
      MetadataEnum.ROLES,
      [context.getHandler(), context.getClass()],
    );

    const isAuthorizedRoute = ['auth', 'otp/request'].some((path) =>
      request.url.includes(path),
    );

    if (!user.is_account_verified && !isAuthorizedRoute) {
      throw new ForbiddenException('Unverified email!');
    }

    if (
      (['admin', 'parishes'].some((path) => request.url.includes(path)) &&
        !requiredRole.includes(user.role.toLowerCase() as Role)) ||
      request.url.includes('auth/sign-up')
    ) {
      throw new UnauthorizedException('Access denied!');
    }

    return user as TUser;
  }
}
