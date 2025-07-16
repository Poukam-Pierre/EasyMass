import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OTP, OtpUsage } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ITwoFAService } from '../two-fa.interface';

@Injectable()
export class OTPService implements ITwoFAService<OTP> {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async request(userId: string, usage: OtpUsage): Promise<OTP> {
    const otp = await this.prismaService.oTP.create({
      data: {
        usage,
        code:
          this.configService.get('NODE_ENV') === 'test'
            ? '66666'
            : // TODO: Build out a function to automatically generate code
              Math.floor(Math.random() * 100000).toString(),
        expired_at: new Date(Date.now() + 300_000), //5 minutes
        User: { connect: { user_id: userId } },
      },
    });

    return otp;
  }

  async verify(
    id: string,
    otpCode: string,
    usage?: OtpUsage,
  ): Promise<boolean> {
    const otp = await this.prismaService.oTP.findUnique({
      where: { otp_id: id, is_verified: false, expired_at: { gt: new Date() } },
    });

    if (!otp || otp.code !== otpCode || (usage && otp.usage !== usage)) {
      return false;
    }

    await this.prismaService.oTP.update({
      where: { otp_id: id },
      data: { is_verified: true, updated_at: new Date() },
    });

    return true;
  }

  async resend(userId: string, otpId: string): Promise<OTP> {
    const otp = await this.prismaService.oTP.update({
      data: {
        code:
          this.configService.get('NODE_ENV') === 'test'
            ? '66666'
            : // TODO: Build out a function to automatically generate code
              Math.floor(Math.random() * 100000).toString(),
        expired_at: new Date(Date.now() + 300_000), //5 minutes
      },
      where: { otp_id: otpId, User: { user_id: userId } },
    });

    return otp;
  }
}
