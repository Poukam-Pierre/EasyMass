import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SetMassPriceDto } from './dto/set-mass-price.dto';

@Injectable()
export class MassPriceService {
  constructor(private readonly prismaService: PrismaService) {}

  /** Upserts the listed price for a mass in one currency. */
  async setPrice(massId: string, dto: SetMassPriceDto, setByUserId: string) {
    return this.prismaService.massPrice.upsert({
      where: { massId_currency: { massId, currency: dto.currency } },
      create: {
        massId,
        currency: dto.currency,
        amount: dto.amount,
        setByUserId,
      },
      update: {
        amount: dto.amount,
        setByUserId,
      },
    });
  }

  async findForMass(massId: string) {
    return this.prismaService.massPrice.findMany({ where: { massId } });
  }

  async remove(massId: string, currency: SetMassPriceDto['currency']) {
    return this.prismaService.massPrice.delete({
      where: { massId_currency: { massId, currency } },
    });
  }
}
