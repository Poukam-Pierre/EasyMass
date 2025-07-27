import {
  Body,
  Controller,
  Logger,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Request } from 'express';
import { OTPEntity, OTPPayloadDto, OTPUsageDto } from '../two-fa.dto';
import { OTPService } from './otp.service';

@ApiTags('2FA')
@ApiBearerAuth()
@Controller('two-fa/otp')
export class OTPController {
  constructor(private readonly otpService: OTPService) {}

  private readonly logger = new Logger(OTPController.name);

  @Post('request')
  @ApiCreatedResponse({ type: OTPEntity })
  async requestTwoFA(@Req() req: Request, @Body() usagePayload: OTPUsageDto) {
    const user = req.user as User;
    if (!user) throw new UnauthorizedException('user not connected');

    this.logger.debug('Initialisation of new request otp...');

    const otp = await this.otpService.request(user.user_id, usagePayload.usage);
    // TODO: Add sending OTP logic
    this.logger.debug(
      `Successfully sent requested opt user by mail!:${otp.code}`,
    );

    return new OTPEntity({ ...otp, usage: otp.usage });
  }

  @Patch(':otp_id/resend')
  @ApiCreatedResponse({ type: OTPEntity })
  async resendOTP(@Req() req: Request, @Param('otp_id') otpId: string) {
    const user = req.user as User;
    if (!user) throw new UnauthorizedException('user not connected');

    this.logger.debug('Initialisation of new request otp...');

    const otp = await this.otpService.resend(user.user_id, otpId);

    // TODO: Add sending OTP logic
    this.logger.debug(
      `Successfully resend requested opt user by mail!:${otp.code}`,
    );

    return new OTPEntity({ ...otp, usage: otp.usage });
  }

  @Post('verify')
  @ApiCreatedResponse({
    schema: { properties: { is_verified: { type: 'boolean' } } },
  })
  async verifyOTP(@Body() payload: OTPPayloadDto) {
    const isVerified = await this.otpService.verify(
      payload.otp_id,
      payload.code,
    );
    return { is_verified: isVerified };
  }
}
