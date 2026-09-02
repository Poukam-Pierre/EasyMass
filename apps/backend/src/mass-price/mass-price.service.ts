import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Currency, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BASE_CURRENCY } from '../common/constants';
import { SetMassPriceDto } from './dto/set-mass-price.dto';

/** Either the top-level PrismaService or an interactive-transaction client
 * — both expose the same `.massPrice` model delegate shape. */
type PrismaLike = PrismaService | Prisma.TransactionClient;

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

  /**
   * Resolves each mass's authoritative price in `currency`, in one round
   * trip — this is the only source of truth for what a mass costs; a
   * client-submitted price is never trusted (see CreateTransactionDto).
   * Precedence: MassPrice(massId, currency) if one exists, else Mass.price
   * if `currency` is the base currency (XAF), else that mass has no listed
   * price in that currency and the whole checkout is rejected.
   *
   * Accepts a PrismaLike client so it can run inside PaymentService's
   * interactive transactions (checkout initiation, and again at
   * confirmation to compute the parish/platform split) as well as
   * standalone.
   */
  async resolvePrices(
    client: PrismaLike,
    masses: { massId: string; price: number }[],
    currency: Currency
  ): Promise<Map<string, number>> {
    const overrides = await client.massPrice.findMany({
      where: { massId: { in: masses.map((m) => m.massId) }, currency },
    });
    const overrideByMassId = new Map(
      overrides.map((o) => [o.massId, o.amount])
    );

    const resolved = new Map<string, number>();
    for (const mass of masses) {
      const override = overrideByMassId.get(mass.massId);
      if (override !== undefined) {
        resolved.set(mass.massId, override);
      } else if (currency === BASE_CURRENCY) {
        resolved.set(mass.massId, mass.price);
      } else {
        throw new UnprocessableEntityException('priceNotAvailableInCurrency', {
          cause: new Error(),
          description: `Mass ${mass.massId} has no listed price in ${currency}.`,
        });
      }
    }
    return resolved;
  }
}
