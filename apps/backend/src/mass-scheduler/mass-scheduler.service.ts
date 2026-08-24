import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { MailService } from '../mail/mail.service';

const ORDERING_CUTOFF_MINUTES = 30;

@Injectable()
export class MassSchedulerService {
  private readonly logger = new Logger(MassSchedulerService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly pdfService: PdfService,
    private readonly mailService: MailService
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async runSweeps() {
    await this.closeOrdering();
    await this.startProcessing();
    await this.completeProcessing();
    await this.sendPendingIntentions();
  }

  /** OPEN -> CLOSED once 30 minutes before startAt — a hard business
   * deadline, applied regardless of whether the intentions email succeeds. */
  private async closeOrdering() {
    const cutoff = new Date(
      Date.now() + ORDERING_CUTOFF_MINUTES * 60 * 1000
    );
    await this.prismaService.mass.updateMany({
      where: { status: 'OPEN', startAt: { lte: cutoff } },
      data: { status: 'CLOSED' },
    });
  }

  private async startProcessing() {
    await this.prismaService.mass.updateMany({
      where: { status: 'CLOSED', startAt: { lte: new Date() } },
      data: { status: 'PROCESSING' },
    });
  }

  /** startAt + estimatedDurationMinutes varies per row, so this can't be a
   * single conditional updateMany — fetch PROCESSING masses and filter in
   * JS (cheap at this scale: only currently-processing masses). */
  private async completeProcessing() {
    const processing = await this.prismaService.mass.findMany({
      where: { status: 'PROCESSING' },
      select: { massId: true, startAt: true, estimatedDurationMinutes: true },
    });

    const now = Date.now();
    const doneIds = processing
      .filter(
        (m) => m.startAt.getTime() + m.estimatedDurationMinutes * 60 * 1000 <= now
      )
      .map((m) => m.massId);

    if (doneIds.length === 0) return;

    await this.prismaService.mass.updateMany({
      where: { massId: { in: doneIds } },
      data: { status: 'COMPLETED' },
    });
  }

  /** Independent of status transitions so a mail failure can be retried
   * every tick without blocking the ordering-cutoff deadline. */
  private async sendPendingIntentions() {
    const pending = await this.prismaService.mass.findMany({
      where: {
        status: { in: ['CLOSED', 'PROCESSING', 'COMPLETED'] },
        intentionsSentAt: null,
      },
      include: {
        parish: { include: { user: true } },
        massOrder: { include: { orderByBeliever: true }, orderBy: { createdAt: 'asc' } },
      },
    });

    for (const mass of pending) {
      try {
        const pdf = await this.pdfService.generateIntentionsPdf(
          `Mass Intentions — ${mass.startAt.toISOString()}`,
          mass.massOrder.map((o) => ({
            believerName: o.orderByBeliever.fullName,
            intension: o.intension,
          }))
        );

        await this.mailService.sendWithAttachment(
          mass.parish.user.email,
          'Mass intentions',
          `Attached are the gathered intentions for your mass starting ${mass.startAt.toISOString()}.`,
          { filename: `intentions-${mass.massId}.pdf`, content: pdf }
        );

        await this.prismaService.mass.update({
          where: { massId: mass.massId },
          data: { intentionsSentAt: new Date() },
        });
      } catch (error) {
        this.logger.error(
          `Failed to send intentions for mass ${mass.massId}: ${error?.message ?? error}`
        );
      }
    }
  }
}
