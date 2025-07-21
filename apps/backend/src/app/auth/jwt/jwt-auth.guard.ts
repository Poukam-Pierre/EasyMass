import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
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

    if (isPublic || isPriestSignup) return isPublic;

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

    const isAuthorizedRoute = ['auth', 'otp/request'].some((path) =>
      request.url.includes(path),
    );

    if (!user.is_account_verified && !isAuthorizedRoute) {
      throw new ForbiddenException('Unverified email!');
    }

    return user as TUser;
  }
}
