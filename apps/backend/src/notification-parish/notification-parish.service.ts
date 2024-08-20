import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationParishService {
  constructor(private primaService: PrismaService) {}

  async create(createNotifParisDto: Prisma.NotificationParishCreateInput) {
    return this.primaService.notificationParish.create({
      data: createNotifParisDto,
    });
  }
}
