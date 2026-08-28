import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PlatformSettingsController } from './platform-settings.controller';
import { PlatformSettingsService } from './platform-settings.service';

@Module({
  imports: [PrismaModule],
  providers: [PlatformSettingsService],
  controllers: [PlatformSettingsController],
  exports: [PlatformSettingsService],
})
export class PlatformSettingsModule {}
