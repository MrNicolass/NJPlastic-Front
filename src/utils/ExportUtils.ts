import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { njPalette } from '@/theme/njTheme';

export type ExportColumn<T = Record<string, unknown>> = {
  key: keyof T & string;
  label: string;
  format?: (value: unknown, row: T) => string;
};

export type ExportMeta = {
  title?: string;
  subtitle?: string;
  filters?: Record<string, string | undefined>;
};

const formatCell = <T>(row: T, column: ExportColumn<T>): string => {
  const raw = (row as Record<string, unknown>)[column.key];
  if (column.format) {
    return column.format(raw, row);
  }
  if (raw === null || raw === undefined) {
    return '';
  }
  return String(raw);
};

const escapeCsv = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
};

const triggerDownload = (blob: Blob, filename: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

const hexToRgb = (hex: string): [number, number, number] => {
  const stripped = hex.replace('#', '');
  const value = parseInt(stripped, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

/**
 * Convert a collection of rows into a CSV string and trigger a browser
 * download. Quoting matches the backend ReportGenerationService.safe(...)
 * (commas, double quotes and newlines escaped; double quotes doubled).
 */
export function exportToCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: ExportColumn<T>[],
  filename: string,
): void {
  const header = columns.map((col) => escapeCsv(col.label)).join(',');
  const body = rows
    .map((row) => columns.map((col) => escapeCsv(formatCell(row, col))).join(','))
    .join('\n');
  const csv = `${header}\n${body}\n`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename);
}

/**
 * Render a collection of rows as a PDF table with the NJPlastic palette and
 * trigger a browser download. Header band uses the primary cobalt color;
 * footer carries the generation timestamp and the applied filter snapshot.
 */
export function exportToPdf<T extends Record<string, unknown>>(
  rows: T[],
  columns: ExportColumn<T>[],
  filename: string,
  meta?: ExportMeta,
): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const title = meta?.title ?? 'Relatório NJPlastic';
  const headerRgb = hexToRgb(njPalette.cobalt);

  doc.setFontSize(14);
  doc.setTextColor(...hexToRgb(njPalette.charcoal));
  doc.text(title, 40, 40);
  if (meta?.subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(...hexToRgb(njPalette.warmGray));
    doc.text(meta.subtitle, 40, 58);
  }

  const head = [columns.map((col) => col.label)];
  const body = rows.map((row) => columns.map((col) => formatCell(row, col)));

  autoTable(doc, {
    startY: meta?.subtitle ? 70 : 56,
    head,
    body,
    theme: 'striped',
    headStyles: {
      fillColor: headerRgb,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 240, 230],
    },
    styles: {
      fontSize: 9,
      cellPadding: 6,
    },
    margin: { top: 56, right: 40, bottom: 40, left: 40 },
  });

  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(...hexToRgb(njPalette.warmGray));
  const generatedAt = new Date().toLocaleString('pt-BR');
  const filterLine = meta?.filters
    ? Object.entries(meta.filters)
        .filter(([, value]) => value !== undefined && value !== '')
        .map(([label, value]) => `${label}: ${value}`)
        .join('  •  ')
    : '';
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(`Gerado em ${generatedAt}`, 40, pageHeight - 20);
    if (filterLine) {
      doc.text(filterLine, 40, pageHeight - 8);
    }
    doc.text(`Página ${page} / ${pageCount}`, pageWidth - 80, pageHeight - 20);
  }

  doc.save(filename);
}

/**
 * Build a filename from a pattern. The pattern accepts placeholders:
 * - {timestamp}: yyyyMMdd-HHmmss
 * - {date}: yyyy-MM-dd
 *
 * @example buildExportFilename('shift_report_{timestamp}', 'csv') -> 'shift_report_20260610-143022.csv'
 */
export function buildExportFilename(pattern: string, extension: 'csv' | 'pdf'): string {
  const now = new Date();
  const pad = (value: number) => value.toString().padStart(2, '0');
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const filled = pattern.replace('{timestamp}', timestamp).replace('{date}', date);
  return `${filled}.${extension}`;
}
