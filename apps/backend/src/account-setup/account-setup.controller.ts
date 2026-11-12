import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Public } from '../auth/decorator/public.decorator';
import { RateLimited } from '../common/rate-limited.decorator';
import { AccountSetupService } from './account-setup.service';
import { CompleteAccountSetupDto } from './dto/complete-account-setup.dto';
import { PreviewAccountSetupDto } from './dto/preview-account-setup.dto';

/** Public: the emailed token is the only credential a not-yet-set-up
 * account has, so both routes are rate-limited against token guessing.
 * The token always travels in a POST body, never a URL path, so it can't
 * end up in proxy access logs. */
@Controller('account-setup')
export class AccountSetupController {
  constructor(private readonly accountSetupService: AccountSetupService) {}

  /** Read-only despite being a POST (see AccountSetupService.previewSetup). */
  @Public()
  @RateLimited(10)
  @Post('preview')
  @HttpCode(200)
  preview(@Body() input: PreviewAccountSetupDto) {
    return this.accountSetupService.previewSetup(input.token);
  }

  @Public()
  @RateLimited(10)
  @Post()
  async complete(@Body() input: CompleteAccountSetupDto) {
    await this.accountSetupService.completeSetup(input.token, input.password);
    return { code: 200, message: 'Account setup completed.' };
  }
}
