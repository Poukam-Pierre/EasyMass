import { Injectable } from '@nestjs/common';
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
   * Renders a simple document: title, then the intentions oldest-to-newest
   * as "believer name — intention". Caller is responsible for ordering
   * `intentions` (MassOrderService.findMassOrderByMass already returns
   * oldest-first).
   */
  async generateIntentionsPdf(
    title: string,
    intentions: IntentionRow[]
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(18).text(title, { align: 'center' });
      doc.moveDown(1.5);

      if (intentions.length === 0) {
        doc.fontSize(12).text('No intentions were submitted for this mass.');
      } else {
        intentions.forEach((row, index) => {
          doc
            .fontSize(12)
            .text(`${index + 1}. ${row.believerName} — ${row.intension}`);
          doc.moveDown(0.5);
        });
      }

      doc.end();
    });
  }
}
