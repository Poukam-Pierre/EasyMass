import { Injectable } from '@nestjs/common';
import { MassType } from '@prisma/client';
import PDFDocument from 'pdfkit';

export interface IntentionRow {
  believerName: string;
  intension: string;
}

export interface InvoiceLine {
  parishName: string;
  massDate: Date;
  intension: string;
  amount: number;
  currency: string;
}

export interface InvoiceDetails {
  believerName: string;
  reference: string;
  paidAt: Date;
  lines: InvoiceLine[];
}

const MASS_TYPE_LABELS: Record<MassType, string> = {
  UNIQUE: 'Unique',
  TRIDUUM: 'Triduum',
  SEVEN: 'Seven-Day',
  NOVENA: 'Novena',
  THIRTY: 'Thirty-Day',
};

/** "Unique Mass — Paroisse Saint-Test — Fri, Aug 28 2026, 7:00 PM" —
 * shared by the on-demand download and the scheduled email attachment so
 * both PDFs identify the mass the same way. */
export function formatMassSubtitle(
  massType: MassType,
  startAt: Date,
  parishName: string
): string {
  const formattedDate = startAt.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${MASS_TYPE_LABELS[massType]} Mass — ${parishName} — ${formattedDate}`;
}

@Injectable()
export class PdfService {
  /** One line per mass paid for in this checkout, plus the total —
   * intentionally simple (no logo/branding) since it's a transactional
   * receipt, not a marketing document. */
  async generateInvoicePdf(details: InvoiceDetails): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(18).text('EasyMesse — Payment Receipt', { align: 'center' });
      doc.moveDown(1);
      doc.fontSize(10);
      doc.text(`Receipt for: ${details.believerName}`);
      doc.text(`Reference: ${details.reference}`);
      doc.text(`Paid: ${details.paidAt.toISOString()}`);
      doc.moveDown(1);

      let total = 0;
      details.lines.forEach((line, index) => {
        total += line.amount;
        doc
          .fontSize(12)
          .text(
            `${index + 1}. ${line.parishName} — ${line.massDate.toDateString()}`
          );
        doc.fontSize(10).text(`   Intention: ${line.intension}`);
        doc
          .fontSize(10)
          .text(`   Amount: ${line.amount.toFixed(2)} ${line.currency}`);
        doc.moveDown(0.5);
      });

      doc.moveDown(0.5);
      doc
        .fontSize(12)
        .text(`Total: ${total.toFixed(2)} ${details.lines[0]?.currency ?? ''}`, {
          align: 'right',
        });

      doc.end();
    });
  }

  /**
   * Renders the intentions oldest-to-newest as one entry per requester:
   * their name on its own line, the intention text wrapped below it (not
   * aligned alongside the name — intentions run long enough that inline
   * pairing was cramming them into a single unreadable line). Caller is
   * responsible for ordering `intentions` (MassOrderService.findMassOrderByMass
   * already returns oldest-first).
   */
  async generateIntentionsPdf(
    title: string,
    subtitle: string,
    intentions: IntentionRow[]
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.font('Helvetica-Bold').fontSize(18).text(title, { align: 'center' });
      doc.moveDown(0.3);
      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor('#555555')
        .text(subtitle, { align: 'center' });
      doc.fillColor('#000000');
      doc.moveDown(1.5);

      if (intentions.length === 0) {
        doc.fontSize(12).text('No intentions were submitted for this mass.');
      } else {
        intentions.forEach((row, index) => {
          doc
            .font('Helvetica-Bold')
            .fontSize(12)
            .fillColor('#000000')
            .text(`${index + 1}. ${row.believerName}`);
          doc.moveDown(0.15);
          doc
            .font('Helvetica-Oblique')
            .fontSize(11)
            .fillColor('#333333')
            .text(row.intension);
          doc.fillColor('#000000');
          doc.moveDown(0.8);
        });
      }

      doc.end();
    });
  }
}
