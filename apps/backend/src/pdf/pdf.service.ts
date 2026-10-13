import { Injectable } from '@nestjs/common';
import { Language, MassType } from '@prisma/client';
import { join } from 'path';
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

/** Mirrors the wording already used in the app's own UI (see
 * libs/theme/src/languages/{en-us,fr}/website.ts's unique/triduum/seven/
 * novena/thirty keys) so a mass type reads the same in the PDF as it does
 * on screen, rather than introducing separate translations here. */
const MASS_TYPE_LABELS: Record<Language, Record<MassType, string>> = {
  EN: {
    UNIQUE: 'Unique',
    TRIDUUM: 'Triduum',
    SEVEN: 'Seven-Day',
    NOVENA: 'Novena',
    THIRTY: 'Thirty-Day',
  },
  FR: {
    UNIQUE: 'Unique',
    TRIDUUM: 'Triduum',
    SEVEN: 'Septaine',
    NOVENA: 'Neuvaine',
    THIRTY: 'Trentaine',
  },
};

/** Every static label generateIntentionsPdf renders — never applied to the
 * intention text itself, which is free-form user content that may be in
 * either language regardless of the parish's own setting. */
const INTENTIONS_PDF_TEXT: Record<
  Language,
  { title: string; noIntentions: string; footer: (count: number) => string }
> = {
  EN: {
    title: 'Mass Intentions',
    noIntentions: 'No intentions were submitted for this mass.',
    footer: (count) => `${count} intention${count === 1 ? '' : 's'} — EasyMesse`,
  },
  FR: {
    title: 'Intentions de messe',
    noIntentions: "Aucune intention n'a été soumise pour cette messe.",
    footer: (count) => `${count} intention${count === 1 ? '' : 's'} — EasyMesse`,
  },
};

/** Copied into src/assets at build time (see webpack.config.js's `assets`
 * entry) and bundled as a single file alongside main.js, so this resolves
 * the same way in both `nx serve` and a production build — no separate
 * dev-vs-prod path handling needed. */
const LOGO_PATH = join(__dirname, 'assets', 'logo.png');

const BRAND_COLOR = '#026da9';
const TEXT_COLOR = '#1a1a1a';
const MUTED_COLOR = '#666666';
const LINE_COLOR = '#dddddd';

/** "Unique Mass — Paroisse Saint-Test — Fri, Aug 28 2026, 7:00 PM" (or its
 * French equivalent) — shared by the on-demand download and the scheduled
 * email attachment so both PDFs identify the mass the same way, in the
 * owning parish's own language. */
export function formatMassSubtitle(
  massType: MassType,
  startAt: Date,
  parishName: string,
  language: Language
): string {
  const formattedDate = startAt.toLocaleString(
    language === 'FR' ? 'fr-FR' : 'en-US',
    {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }
  );
  const label = MASS_TYPE_LABELS[language][massType];
  return language === 'FR'
    ? `Messe ${label} — ${parishName} — ${formattedDate}`
    : `${label} Mass — ${parishName} — ${formattedDate}`;
}

/** "EasyMesse" wordmark + the document's own title/subtitle on the left,
 * the logo on the right, and a divider rule below — shared by every PDF
 * this service generates so they all read as the same document family.
 * Leaves doc.y positioned right below the divider, ready for the caller's
 * content. Drawn once, at the top of page 1 only — a multi-page document's
 * later pages just continue the content, they don't repeat the header. */
function renderHeader(
  doc: PDFKit.PDFDocument,
  title: string,
  subtitle?: string
): void {
  const margin = doc.page.margins.left;
  const contentWidth = doc.page.width - margin - doc.page.margins.right;
  const logoWidth = 78;
  const headerTop = margin;
  const textWidth = contentWidth - logoWidth - 16;

  doc
    .font('Helvetica-Bold')
    .fontSize(19)
    .fillColor(TEXT_COLOR)
    .text('EasyMesse', margin, headerTop, { width: textWidth });
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor(BRAND_COLOR)
    .text(title, margin, doc.y + 2, { width: textWidth });
  if (subtitle) {
    doc
      .font('Helvetica')
      .fontSize(9.5)
      .fillColor(MUTED_COLOR)
      .text(subtitle, margin, doc.y + 2, { width: textWidth });
  }

  try {
    doc.image(LOGO_PATH, margin + contentWidth - logoWidth, headerTop, { width: logoWidth });
  } catch {
    // A missing/unreadable logo file must never break PDF generation —
    // the document is still useful without branding.
  }

  const headerBottom = Math.max(doc.y, headerTop + 40) + 14;
  doc
    .moveTo(margin, headerBottom)
    .lineTo(margin + contentWidth, headerBottom)
    .lineWidth(1)
    .strokeColor(LINE_COLOR)
    .stroke();
  doc.fillColor('#000000').strokeColor('#000000');
  doc.y = headerBottom + 20;
}

/** A short closing line under a divider rule, at wherever content ends. */
function renderFooter(doc: PDFKit.PDFDocument, text: string): void {
  doc.moveDown(1.5);
  const margin = doc.page.margins.left;
  const contentWidth = doc.page.width - margin - doc.page.margins.right;
  doc
    .moveTo(margin, doc.y)
    .lineTo(margin + contentWidth, doc.y)
    .lineWidth(0.5)
    .strokeColor('#e5e5e5')
    .stroke();
  doc.moveDown(0.6);
  doc.font('Helvetica').fontSize(8.5).fillColor('#999999').text(text, { align: 'center' });
  doc.fillColor('#000000').strokeColor('#000000');
}

/** Forces a page break BEFORE drawing anything for the next block, if that
 * block (of the given height) wouldn't fully fit on the current page.
 * Necessary because rect()/circle() — unlike text() — never auto-paginate
 * on their own: without this, a row whose background or badge is drawn
 * without checking first can end up split across two pages, or drawn past
 * the bottom of the current one entirely. */
function ensureSpace(doc: PDFKit.PDFDocument, height: number): void {
  const bottom = doc.page.height - doc.page.margins.bottom;
  if (doc.y + height > bottom) {
    doc.addPage();
  }
}

@Injectable()
export class PdfService {
  /** One line per mass paid for in this checkout, plus the total. */
  async generateInvoicePdf(details: InvoiceDetails): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      renderHeader(doc, 'Payment Receipt');

      const margin = doc.page.margins.left;
      const contentWidth = doc.page.width - margin - doc.page.margins.right;

      // Meta box — receipt for / reference / paid date, three columns.
      const boxTop = doc.y;
      const colWidth = contentWidth / 3;
      const metaRows: [string, string][] = [
        ['RECEIPT FOR', details.believerName],
        ['REFERENCE', details.reference],
        [
          'PAID',
          details.paidAt.toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }),
        ],
      ];
      let maxValueHeight = 0;
      metaRows.forEach(([, value]) => {
        const h = doc
          .font('Helvetica')
          .fontSize(10.5)
          .heightOfString(value, { width: colWidth - 20 });
        maxValueHeight = Math.max(maxValueHeight, h);
      });
      const boxHeight = 24 + maxValueHeight + 16;

      doc.roundedRect(margin, boxTop, contentWidth, boxHeight, 4).fill('#f7f8fa');
      metaRows.forEach(([label, value], i) => {
        const x = margin + i * colWidth + 14;
        doc
          .font('Helvetica-Bold')
          .fontSize(8)
          .fillColor('#8a8a8a')
          .text(label, x, boxTop + 12, { width: colWidth - 20 });
        doc
          .font('Helvetica')
          .fontSize(10.5)
          .fillColor(TEXT_COLOR)
          .text(value, x, boxTop + 26, { width: colWidth - 20 });
      });
      doc.fillColor('#000000');
      doc.y = boxTop + boxHeight + 24;

      // Line-item table.
      const cols = {
        mass: { x: margin, width: contentWidth * 0.42 },
        date: { x: margin + contentWidth * 0.42, width: contentWidth * 0.28 },
        amount: { x: margin + contentWidth * 0.7, width: contentWidth * 0.3 },
      };
      ensureSpace(doc, 22 + 40);
      const tableHeaderTop = doc.y;
      doc.rect(margin, tableHeaderTop, contentWidth, 22).fill(BRAND_COLOR);
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff');
      doc.text('MASS', cols.mass.x + 10, tableHeaderTop + 6, { width: cols.mass.width - 10 });
      doc.text('DATE', cols.date.x, tableHeaderTop + 6, { width: cols.date.width });
      doc.text('AMOUNT', cols.amount.x, tableHeaderTop + 6, {
        width: cols.amount.width - 10,
        align: 'right',
      });
      doc.fillColor('#000000');
      doc.y = tableHeaderTop + 22;

      let total = 0;
      details.lines.forEach((line, index) => {
        total += line.amount;
        const textWidth = cols.mass.width - 10;
        const intentionText = `Intention: ${line.intension}`;
        const intentionHeight = doc
          .font('Helvetica-Oblique')
          .fontSize(9)
          .heightOfString(intentionText, { width: textWidth });
        const rowHeight = 16 + intentionHeight + 14;

        ensureSpace(doc, rowHeight);
        const rowTop = doc.y + 10;

        if (index % 2 === 1) {
          doc.rect(margin, rowTop - 6, contentWidth, rowHeight - 4).fill('#f7f8fa');
        }

        doc
          .font('Helvetica-Bold')
          .fontSize(10.5)
          .fillColor(TEXT_COLOR)
          .text(line.parishName, cols.mass.x + 10, rowTop, { width: textWidth });
        doc
          .font('Helvetica')
          .fontSize(9.5)
          .fillColor('#333333')
          .text(line.massDate.toDateString(), cols.date.x, rowTop, { width: cols.date.width });
        doc
          .font('Helvetica-Bold')
          .fontSize(10.5)
          .fillColor(TEXT_COLOR)
          .text(`${line.amount.toFixed(2)} ${line.currency}`, cols.amount.x, rowTop, {
            width: cols.amount.width - 10,
            align: 'right',
          });
        doc
          .font('Helvetica-Oblique')
          .fontSize(9)
          .fillColor(MUTED_COLOR)
          .text(intentionText, cols.mass.x + 10, rowTop + 16, { width: textWidth });

        doc.fillColor('#000000');
        doc.y = rowTop - 10 + rowHeight;
      });

      ensureSpace(doc, 40);
      doc.y += 4;
      doc
        .moveTo(margin, doc.y)
        .lineTo(margin + contentWidth, doc.y)
        .lineWidth(1)
        .strokeColor(TEXT_COLOR)
        .stroke();
      doc.y += 8;
      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor(TEXT_COLOR)
        .text(`Total: ${total.toFixed(2)} ${details.lines[0]?.currency ?? ''}`, margin, doc.y, {
          width: contentWidth,
          align: 'right',
        });

      renderFooter(doc, 'Thank you for your generosity. — EasyMesse');

      doc.end();
    });
  }

  /**
   * Renders the intentions oldest-to-newest as one numbered entry per
   * requester. Caller is responsible for ordering `intentions`
   * (MassOrderService.findMassOrderByMass already returns oldest-first).
   * `language` only affects this document's own static wording (title,
   * "no intentions" message, footer) — never the intention text itself,
   * which is free-form user content that may be in either language
   * regardless of the parish's own setting.
   */
  async generateIntentionsPdf(
    subtitle: string,
    intentions: IntentionRow[],
    language: Language
  ): Promise<Buffer> {
    const text = INTENTIONS_PDF_TEXT[language];
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      renderHeader(doc, text.title, subtitle);

      const margin = doc.page.margins.left;
      const contentWidth = doc.page.width - margin - doc.page.margins.right;

      if (intentions.length === 0) {
        doc
          .font('Helvetica')
          .fontSize(12)
          .fillColor(MUTED_COLOR)
          .text(text.noIntentions);
        doc.fillColor('#000000');
      } else {
        intentions.forEach((row, index) => {
          doc
            .font('Helvetica-Bold')
            .fontSize(12)
            .fillColor(TEXT_COLOR)
            .text(`${index + 1}. ${row.believerName}`, margin, doc.y, { width: contentWidth });
          doc.moveDown(0.15);
          doc
            .font('Helvetica-Oblique')
            .fontSize(11)
            .fillColor('#333333')
            .text(row.intension, margin, doc.y, { width: contentWidth });
          doc.fillColor('#000000');
          doc.moveDown(0.8);
        });
      }

      renderFooter(doc, text.footer(intentions.length));

      doc.end();
    });
  }
}
