import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationPriestService {
  constructor(private primaService: PrismaService) {}

  async create(createNotifPriestDto: Prisma.NotificationPriestCreateInput) {
    return this.primaService.notificationPriest.create({
      data: createNotifPriestDto,
    });
  }
}
