import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Query,
  Request,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorator/roles.decorator';
import { AuthenticatedRequest } from '../common/authenticated-request';
import { RemovePlatformSettingsDto } from './dto/remove-platform-settings.dto';
import { UpdatePlatformSettingsDto } from './dto/update-platform-settings.dto';
import { PlatformSettingsService } from './platform-settings.service';

@Controller('platform-settings')
@Roles(UserRole.ADMIN)
export class PlatformSettingsController {
  constructor(
    private readonly platformSettingsService: PlatformSettingsService
  ) {}

  @Get()
  findAll() {
    return this.platformSettingsService.findAll();
  }

  @Patch()
  upsert(
    @Body() dto: UpdatePlatformSettingsDto,
    @Request() request: AuthenticatedRequest
  ) {
    const { currency, ...rest } = dto;
    return this.platformSettingsService.upsert(currency, rest, request.user.id);
  }

  @Delete()
  remove(@Query() { currency }: RemovePlatformSettingsDto) {
    return this.platformSettingsService.remove(currency);
  }
}
