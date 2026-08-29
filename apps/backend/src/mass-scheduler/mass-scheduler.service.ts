import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MassService } from '../mass/mass.service';
import { formatMassSubtitle, PdfService } from '../pdf/pdf.service';
import { MailService } from '../mail/mail.service';

/** How many masses' PDF+email sends run concurrently per tick — bounded so
 * a large backlog doesn't fire off unbounded parallel SMTP connections /
 * PDF generations at once, while still not serializing the whole batch. */
const INTENTIONS_SEND_CONCURRENCY = 5;

@Injectable()
export class MassSchedulerService {
  private readonly logger = new Logger(MassSchedulerService.name);

  constructor(
    private readonly massService: MassService,
    private readonly pdfService: PdfService,
    private readonly mailService: MailService
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async runSweeps() {
    await this.massService.sweepStatusTransitions();
    await this.sendPendingIntentions();
  }

  private async sendPendingIntentions() {
    const pending = await this.massService.findPendingIntentions();

    for (let i = 0; i < pending.length; i += INTENTIONS_SEND_CONCURRENCY) {
      const batch = pending.slice(i, i + INTENTIONS_SEND_CONCURRENCY);
      await Promise.all(batch.map((mass) => this.sendOne(mass)));
    }
  }

  private async sendOne(mass: Awaited<
    ReturnType<MassService['findPendingIntentions']>
  >[number]) {
    try {
      const pdf = await this.pdfService.generateIntentionsPdf(
        'Mass Intentions',
        formatMassSubtitle(mass.massType, mass.startAt, mass.parish.name),
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

      await this.massService.markIntentionsSent(mass.massId);
    } catch (error) {
      this.logger.error(
        `Failed to send intentions for mass ${mass.massId}: ${error?.message ?? error}`
      );
    }
  }
}
