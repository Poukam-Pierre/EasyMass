import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY, ROLE } from './decorator/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly JwtService: JwtService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiredRole = this.reflector.get<ROLE[]>(
      'role',
      context.getHandler()
    );

    if (isPublic || !requiredRole) return true;

    const request = context.switchToHttp().getRequest();

    const userRole: ROLE[] = request.user?.role; // Don't forget to set the user role during authentication.
    if (!userRole || userRole.length === 0) return false;

    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.JwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
      });
      request['user'] = payload;

      return userRole.some((role) => requiredRole.includes(role));
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
