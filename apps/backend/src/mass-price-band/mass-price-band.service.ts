import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Currency } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMassPriceBandDto } from './dto/create-mass-price-band.dto';
import { UpdateMassPriceBandDto } from './dto/update-mass-price-band.dto';

@Injectable()
export class MassPriceBandService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(currency?: Currency) {
    return this.prismaService.massPriceBand.findMany({
      where: currency ? { currency } : undefined,
      orderBy: [{ currency: 'asc' }, { minPrice: 'asc' }],
    });
  }

  async create(dto: CreateMassPriceBandDto, setByUserId: string) {
    this.validateRange(dto.minPrice, dto.maxPrice);
    await this.assertNoOverlap(dto.currency, dto.minPrice, dto.maxPrice);
    return this.prismaService.massPriceBand.create({
      data: { ...dto, setByUserId },
    });
  }

  async update(
    massPriceBandId: string,
    dto: UpdateMassPriceBandDto,
    setByUserId: string
  ) {
    const existing = await this.prismaService.massPriceBand.findUnique({
      where: { massPriceBandId },
    });
    if (!existing) {
      throw new NotFoundException('Price band not found.');
    }

    const minPrice = dto.minPrice ?? existing.minPrice;
    const maxPrice = dto.maxPrice ?? existing.maxPrice;
    this.validateRange(minPrice, maxPrice);
    await this.assertNoOverlap(existing.currency, minPrice, maxPrice, massPriceBandId);

    return this.prismaService.massPriceBand.update({
      where: { massPriceBandId },
      data: {
        minPrice,
        maxPrice,
        amount: dto.amount ?? existing.amount,
        setByUserId,
      },
    });
  }

  async remove(massPriceBandId: string) {
    const existing = await this.prismaService.massPriceBand.findUnique({
      where: { massPriceBandId },
    });
    if (!existing) {
      throw new NotFoundException('Price band not found.');
    }
    return this.prismaService.massPriceBand.delete({ where: { massPriceBandId } });
  }

  private validateRange(minPrice: number, maxPrice: number) {
    if (maxPrice <= minPrice) {
      throw new BadRequestException(
        "A band's maximum price must be greater than its minimum price.",
        { cause: new Error() }
      );
    }
  }

  /** Two [min, max) bands for the same currency overlap iff each one starts
   * before the other ends — reject that so a mass's XAF price can never
   * match more than one band at once. */
  private async assertNoOverlap(
    currency: Currency,
    minPrice: number,
    maxPrice: number,
    excludeId?: string
  ) {
    const overlapping = await this.prismaService.massPriceBand.findFirst({
      where: {
        currency,
        massPriceBandId: excludeId ? { not: excludeId } : undefined,
        minPrice: { lt: maxPrice },
        maxPrice: { gt: minPrice },
      },
    });
    if (overlapping) {
      throw new BadRequestException(
        `This range overlaps an existing ${currency} band (${overlapping.minPrice}–${overlapping.maxPrice}).`,
        { cause: new Error() }
      );
    }
  }
}
