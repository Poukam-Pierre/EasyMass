import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

export interface IntentionRow {
  believerName: string;
  intension: string;
}

@Injectable()
export class PdfService {
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
