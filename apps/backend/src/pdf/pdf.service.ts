import { Injectable } from '@nestjs/common';
import { MassType } from '@prisma/client';
import PDFDocument from 'pdfkit';

export interface IntentionRow {
  believerName: string;
  intension: string;
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
