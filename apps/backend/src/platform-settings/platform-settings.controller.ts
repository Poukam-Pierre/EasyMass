import { Body, Controller, Get, Patch, Request } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorator/roles.decorator';
import { UpdatePlatformSettingsDto } from './dto/update-platform-settings.dto';
import { PlatformSettingsService } from './platform-settings.service';

@Controller('platform-settings')
@Roles(UserRole.ADMIN)
export class PlatformSettingsController {
  constructor(
    private readonly platformSettingsService: PlatformSettingsService
  ) {}

  @Get()
  get() {
    return this.platformSettingsService.get();
  }

  @Patch()
  update(@Body() dto: UpdatePlatformSettingsDto, @Request() request) {
    return this.platformSettingsService.update(dto, request.user.id);
  }
}
