import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createNotifDto: Prisma.NotificationCreateInput) {
    return this.prismaService.notification.create({
      data: createNotifDto,
    });
  }
}
