import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Public } from '../auth/decorator/public.decorator';
import { RateLimited } from '../common/rate-limited.decorator';
import { AccountSetupService } from './account-setup.service';
import { CompleteAccountSetupDto } from './dto/complete-account-setup.dto';
import { PreviewAccountSetupDto } from './dto/preview-account-setup.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';

/** Always the same answer, whether or not the email has an account. */
const RESET_REQUESTED = {
  code: 200,
  message: 'If this email belongs to an account, a reset link has been sent.',
};

/** Public "Forgot password?" flow. Requests are scoped per portal, like
 * login (/auth/login-parish, /auth/login-admin), so a parish email entered
 * on the admin portal sends nothing. Every route is rate-limited; the token
 * always travels in a POST body, never a URL path, so it can't end up in
 * proxy access logs. */
@Controller('password-reset')
export class PasswordResetController {
  constructor(private readonly accountSetupService: AccountSetupService) {}

  @Public()
  @RateLimited(5)
  @Post('request-parish')
  @HttpCode(200)
  async requestParish(@Body() input: RequestPasswordResetDto) {
    await this.accountSetupService.requestPasswordReset(
      input.email,
      UserRole.PARISH
    );
    return RESET_REQUESTED;
  }

  @Public()
  @RateLimited(5)
  @Post('request-admin')
  @HttpCode(200)
  async requestAdmin(@Body() input: RequestPasswordResetDto) {
    await this.accountSetupService.requestPasswordReset(
      input.email,
      UserRole.ADMIN
    );
    return RESET_REQUESTED;
  }

  /** Read-only despite being a POST (see AccountSetupService.previewReset). */
  @Public()
  @RateLimited(10)
  @Post('preview')
  @HttpCode(200)
  preview(@Body() input: PreviewAccountSetupDto) {
    return this.accountSetupService.previewReset(input.token);
  }

  @Public()
  @RateLimited(10)
  @Post()
  async complete(@Body() input: CompleteAccountSetupDto) {
    await this.accountSetupService.completeReset(input.token, input.password);
    return { code: 200, message: 'Password updated.' };
  }
}
