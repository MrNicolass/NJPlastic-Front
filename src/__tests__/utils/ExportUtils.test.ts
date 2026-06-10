/* eslint-disable @typescript-eslint/no-explicit-any */

jest.mock('jspdf', () => {
  const text = jest.fn();
  const save = jest.fn();
  const setFontSize = jest.fn();
  const setTextColor = jest.fn();
  const setPage = jest.fn();
  const internal = {
    pageSize: {
      getHeight: () => 595,
      getWidth: () => 842,
    },
  };
  const instances: any[] = [];
  function jsPDF(this: any) {
    this.text = text;
    this.save = save;
    this.setFontSize = setFontSize;
    this.setTextColor = setTextColor;
    this.setPage = setPage;
    this.internal = internal;
    this.getNumberOfPages = () => 1;
    instances.push(this);
  }
  (jsPDF as any).__mocks = { text, save, setFontSize, setTextColor, setPage, instances };
  return { __esModule: true, default: jsPDF };
});

jest.mock('jspdf-autotable', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  buildExportFilename,
  exportToCsv,
  exportToPdf,
  type ExportColumn,
} from '@/utils/ExportUtils';

type Row = { code: string; description: string; cycles: number };

const columns: ExportColumn<Row>[] = [
  { key: 'code', label: 'Código' },
  { key: 'description', label: 'Descrição' },
  { key: 'cycles', label: 'Ciclos' },
];

describe('ExportUtils', () => {
  let createObjectURLSpy: jest.SpyInstance;
  let revokeObjectURLSpy: jest.SpyInstance;
  let clickSpy: jest.SpyInstance;

  let originalBlob: typeof Blob;

  beforeEach(() => {
    createObjectURLSpy = jest.fn().mockReturnValue('blob://x');
    revokeObjectURLSpy = jest.fn();
    Object.defineProperty(URL, 'createObjectURL', { writable: true, value: createObjectURLSpy });
    Object.defineProperty(URL, 'revokeObjectURL', { writable: true, value: revokeObjectURLSpy });
    clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    originalBlob = global.Blob;
    global.Blob = class FakeBlob {
      __content: string;
      type: string;
      constructor(parts: BlobPart[], options?: BlobPropertyBag) {
        this.__content = parts.join('');
        this.type = options?.type ?? '';
      }
    } as unknown as typeof Blob;
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.Blob = originalBlob;
  });

  afterEach(() => {
    clickSpy.mockRestore();
  });

  describe('exportToCsv', () => {
    it('triggers a download with quoted header and rows', () => {
      const rows: Row[] = [
        { code: 'MAQ-01', description: 'Injetora, linha A', cycles: 123 },
      ];

      exportToCsv(rows, columns, 'machines.csv');

      expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
      const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
      expect(blob.type).toContain('text/csv');
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob://x');
    });

    it('escapes commas, quotes and newlines per RFC4180', () => {
      const rows: Row[] = [
        { code: 'A,B', description: 'Has "quotes"', cycles: 1 },
        { code: 'C\nD', description: 'plain', cycles: 2 },
      ];

      exportToCsv(rows, columns, 'machines.csv');

      const blob = createObjectURLSpy.mock.calls[0][0] as Blob & { __content: string };
      expect(blob.__content).toContain('"A,B"');
      expect(blob.__content).toContain('"Has ""quotes"""');
      expect(blob.__content).toContain('"C\nD"');
    });

    it('replaces null and undefined values with empty strings', () => {
      const rows = [
        { code: null as unknown as string, description: undefined as unknown as string, cycles: 0 },
      ];

      exportToCsv(rows, columns, 'machines.csv');

      const blob = createObjectURLSpy.mock.calls[0][0] as Blob & { __content: string };
      expect(blob.__content.split('\n')[1]).toBe(',,0');
    });

    it('uses the column.format function when supplied', () => {
      const formatted: ExportColumn<Row>[] = [
        ...columns,
        { key: 'cycles', label: 'Ciclos x2', format: (value) => String((value as number) * 2) },
      ];

      exportToCsv([{ code: 'MAQ-01', description: 'x', cycles: 10 }], formatted, 'x.csv');

      const blob = createObjectURLSpy.mock.calls[0][0] as Blob & { __content: string };
      expect(blob.__content).toContain('20');
    });
  });

  describe('exportToPdf', () => {
    it('calls jsPDF.save with the supplied filename and feeds the table to autoTable', () => {
      exportToPdf(
        [{ code: 'MAQ-01', description: 'x', cycles: 1 }],
        columns,
        'shift.pdf',
        { title: 'Custom title', subtitle: 'Sub', filters: { sector: 'INJECAO', empty: undefined } },
      );

      const { save } = (jsPDF as unknown as { __mocks: { save: jest.Mock } }).__mocks;
      expect(save).toHaveBeenCalledWith('shift.pdf');
      const autoTableMock = autoTable as unknown as jest.Mock;
      expect(autoTableMock).toHaveBeenCalledTimes(1);
      const tableArgs = autoTableMock.mock.calls[0][1];
      expect(tableArgs.head).toEqual([['Código', 'Descrição', 'Ciclos']]);
      expect(tableArgs.body).toEqual([['MAQ-01', 'x', '1']]);
    });
  });

  describe('buildExportFilename', () => {
    it('replaces {timestamp} and {date} placeholders and appends the extension', () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-06-10T14:30:22.000-03:00'));
      try {
        expect(buildExportFilename('shift_{timestamp}', 'csv')).toMatch(/^shift_\d{8}-\d{6}\.csv$/);
        expect(buildExportFilename('daily_{date}', 'pdf')).toMatch(/^daily_\d{4}-\d{2}-\d{2}\.pdf$/);
      } finally {
        jest.useRealTimers();
      }
    });

    it('leaves the pattern alone when there are no placeholders', () => {
      expect(buildExportFilename('plain', 'csv')).toBe('plain.csv');
    });
  });
});
