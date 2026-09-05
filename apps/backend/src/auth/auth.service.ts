import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';
import * as bcrypt from 'bcryptjs';
import { AdministratorService } from '../administrator/administrator.service';
import { PrismaService } from '../prisma/prisma.service';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { findUserByEmail, flattenUserRole } from '../common/user.utils';
import { AdminDataDto, LoginDataDto, ParishDataDto } from './dto/login.dto';
import { NewTokens } from './dto/refreshToken.dto';
import { SignUpAdminDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly JwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly adminService: AdministratorService,
    private readonly refreshTokenService: RefreshTokenService
  ) {}

  /**
   * Single login path for every account type this MVP supports. `allowedRoles`
   * scopes which UserRole(s) may authenticate through the calling route (e.g.
   * /login-admin only accepts ADMIN), so a parish credential can't log in
   * through the admin endpoint and vice versa.
   */
  async login(
    input: LoginDataDto,
    allowedRoles: UserRole[]
  ): Promise<ParishDataDto | AdminDataDto> {
    const user = await findUserByEmail(this.prismaService, input.email);

    if (!user || !allowedRoles.includes(user.role)) {
      throw new UnauthorizedException('Wrong email or password.', {
        cause: new Error(),
      });
    }

    const flattened = flattenUserRole(user);
    if (!flattened) {
      throw new UnauthorizedException('Wrong email or password.', {
        cause: new Error(),
      });
    }

    const existingRefreshToken =
      await this.refreshTokenService.findFirstByUser(user.userId);

    if (existingRefreshToken) {
      if (new Date() <= new Date(existingRefreshToken.expiredDate)) {
        throw new ConflictException(
          'Account already logged in. Logout before from the first one.',
          { cause: new Error() }
        );
      }
      await this.refreshTokenService.remove(existingRefreshToken.id);
    }

    const validPassword = await bcrypt.compare(
      input.password,
      flattened.password
    );
    if (!validPassword) {
      throw new UnauthorizedException('Wrong email or password.', {
        cause: new Error(),
      });
    }

    const tokens = await this.issueTokens(
      user.userId,
      user.email,
      user.role
    );

    // Narrowing on flattened.role (not user.role) lets TS actually narrow
    // `flattened`'s type via its own discriminant, so each branch below is
    // real compile-time-checked field access — no cast standing in for a
    // check that was never actually performed. A field renamed in
    // flattenUserRole now fails to compile here instead of silently
    // producing an undefined field at runtime.
    if (flattened.role === UserRole.ADMIN) {
      return new AdminDataDto({
        adminId: flattened.adminId,
        userId: flattened.userId,
        name: flattened.name,
        role: flattened.role,
        email: flattened.email,
        password: flattened.password,
        phone: flattened.phone,
        createdAt: flattened.createdAt,
        ...tokens,
      });
    }

    if (flattened.role === UserRole.PARISH) {
      return new ParishDataDto({
        parishId: flattened.parishId,
        userId: flattened.userId,
        name: flattened.name,
        adminId: flattened.adminId,
        email: flattened.email,
        password: flattened.password,
        phone: flattened.phone,
        managerName: flattened.managerName,
        createdAt: flattened.createdAt,
        ...tokens,
      });
    }

    // Unreachable in practice — `allowedRoles` already restricted this to
    // ADMIN/PARISH above (PRIEST login is deferred, MVP scope) — but keeps
    // the function's return type honest instead of falling through.
    throw new UnauthorizedException('Wrong email or password.', {
      cause: new Error(),
    });
  }

  /**
   * Signs a JWT ({sub, email, role}) and creates the opaque refresh token row.
   */
  private async issueTokens(
    userId: string,
    email: string,
    role: UserRole
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const accessToken = await this.JwtService.signAsync({
        sub: userId,
        email,
        role,
      });
      const refreshToken = createId();

      await this.refreshTokenService.create({
        id: createId(),
        refreshToken,
        expiredDate: this.addOneDay(new Date()),
        user: { connect: { userId } },
      });

      return { accessToken, refreshToken };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error appears while processing the creation of accessToken and refreshToken into db.',
        { cause: new Error() }
      );
    }
  }

  /**
   * Admin-only: create another admin account (multiple admin account
   * management). Does not sign the new admin in.
   */
  async signupAdmin(
    input: SignUpAdminDto
  ): Promise<{ code: number; message: string }> {
    const { email, password, ...rest } = input;

    const existing = await findUserByEmail(this.prismaService, email);
    if (existing) {
      throw new BadRequestException('This account is already in use.', {
        cause: new Error(),
      });
    }

    try {
      const hash = await bcrypt.hash(password, 10);
      await this.adminService.create(rest, email, hash);
      return { code: 200, message: 'New administrator created successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error appears while processing hash and create new user admin into db.',
        { cause: new Error() }
      );
    }
  }

  /**
   * Verifies the refresh token, re-derives the user's identity/role strictly
   * server-side from the token's owning User record (never trusts client
   * input for the new access token's claims), rotates the opaque refresh
   * token string.
   */
  async refreshToken(refreshTokenValue: string): Promise<NewTokens> {
    const refreshData =
      await this.refreshTokenService.findOneWithUser(refreshTokenValue);

    if (!refreshData) {
      throw new UnauthorizedException('User not authorized to refresh token!', {
        cause: new Error(),
      });
    }

    if (new Date(refreshData.expiredDate) <= new Date()) {
      await this.refreshTokenService.remove(refreshData.id);

      throw new UnauthorizedException('Refresh token expired. Please login!', {
        cause: new Error(),
      });
    }

    try {
      const accessToken = await this.JwtService.signAsync({
        sub: refreshData.user.userId,
        email: refreshData.user.email,
        role: refreshData.user.role,
      });
      const newRefreshToken = createId();

      await this.refreshTokenService.update(refreshData.id, {
        refreshToken: newRefreshToken,
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error appears while processing the creation accessToken and update refreshToken into db.',
        { cause: new Error() }
      );
    }
  }

  async logout(refreshToken: string) {
    const refreshData = await this.refreshTokenService.findOne(refreshToken);
    if (!refreshData) {
      throw new UnauthorizedException('User not longer connect!', {
        cause: new Error(),
      });
    }
    try {
      await this.refreshTokenService.remove(refreshData.id);

      return { code: 200, message: 'Disconnect token successfully!' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error appears while processing deconnection.',
        { cause: new Error() }
      );
    }
  }

  private addOneDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    return newDate;
  }
}
