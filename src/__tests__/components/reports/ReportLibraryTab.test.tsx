import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { REPORTS_LIBRARY } from '@/constants/ConstantsAndParams';

// jsdom does not implement these APIs, which antd's Row/Col/Dropdown/RangePicker observe.
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

jest.mock('@/services/ReportsService', () => ({
  __esModule: true,
  default: {
    listHistory: jest.fn(),
    downloadArtifact: jest.fn(),
  },
}));

jest.mock('@/utils/NotificationUtils', () => ({
  __esModule: true,
  NotificationUtils: jest.fn(),
}));

import ReportsService from '@/services/ReportsService';
import { NotificationUtils } from '@/utils/NotificationUtils';
import { ReportLibraryTab } from '@/components/reports/ReportLibraryTab';

const mockedService = ReportsService as jest.Mocked<typeof ReportsService>;
const mockedNotificationUtils = NotificationUtils as jest.Mock;

const buildPage = (rows: unknown[]) => ({
  content: rows,
  number: 0,
  size: 20,
  totalElements: rows.length,
  totalPages: 1,
  first: true,
  last: true,
  empty: rows.length === 0,
});

describe('ReportLibraryTab', () => {
  beforeEach(() => {
    mockedService.listHistory.mockReset();
    mockedService.downloadArtifact.mockReset();
    mockedNotificationUtils.mockClear();
  });

  it('lists rows returned by the service', async () => {
    mockedService.listHistory.mockResolvedValueOnce(
      buildPage([
        {
          id: 'r1',
          scheduleId: null,
          type: 'SHIFT',
          generatedAt: '2026-06-10T10:00:00Z',
          format: 'CSV',
          path: '/var/reports/shift.csv',
          sizeBytes: 2048,
        },
      ]) as never,
    );

    render(<ReportLibraryTab />);

    expect(await screen.findByText('SHIFT')).toBeInTheDocument();
    expect(screen.getByText('CSV')).toBeInTheDocument();
    expect(screen.getByText('2.0 KB')).toBeInTheDocument();
    expect(screen.getByText(REPORTS_LIBRARY.ORIGIN.MANUAL)).toBeInTheDocument();
  });

  it('emits an error notification when the listing call fails', async () => {
    mockedService.listHistory.mockRejectedValueOnce(new Error('500'));

    render(<ReportLibraryTab />);

    await waitFor(() => {
      expect(mockedNotificationUtils).toHaveBeenCalledWith(
        expect.objectContaining({
          key: REPORTS_LIBRARY.NOTIFICATIONS.ERROR.KEYS.LIST_FAILED,
          type: 'error',
        }),
      );
    });
  });

  it('downloads an artifact when the row action is clicked', async () => {
    const blob = new Blob(['payload'], { type: 'text/csv' });
    mockedService.listHistory.mockResolvedValueOnce(
      buildPage([
        {
          id: 'r2',
          scheduleId: 'sched-7',
          type: 'DAILY',
          generatedAt: '2026-06-10T10:00:00Z',
          format: 'CSV',
          path: '/var/reports/daily.csv',
          sizeBytes: 800,
        },
      ]) as never,
    );
    mockedService.downloadArtifact.mockResolvedValueOnce(blob);

    const createObjectURLSpy = jest.fn().mockReturnValue('blob://x');
    const revokeObjectURLSpy = jest.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURLSpy });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURLSpy });
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    const user = userEvent.setup();
    render(<ReportLibraryTab />);

    const button = await screen.findByRole('button', { name: REPORTS_LIBRARY.DOWNLOAD_BUTTON });
    await user.click(button);

    await waitFor(() => {
      expect(mockedService.downloadArtifact).toHaveBeenCalledWith('r2', true);
      expect(clickSpy).toHaveBeenCalled();
      expect(mockedNotificationUtils).toHaveBeenCalledWith(
        expect.objectContaining({
          key: REPORTS_LIBRARY.NOTIFICATIONS.SUCCESS.KEYS.DOWNLOADED,
          type: 'success',
        }),
      );
    });

    clickSpy.mockRestore();
  });

  it('shows the SCHEDULED origin label when scheduleId is non-null', async () => {
    mockedService.listHistory.mockResolvedValueOnce(
      buildPage([
        {
          id: 'r3',
          scheduleId: 'sched-1',
          type: 'WEEKLY',
          generatedAt: '2026-06-10T10:00:00Z',
          format: 'CSV',
          path: '/var/reports/weekly.csv',
          sizeBytes: 1024 * 1024 * 3,
        },
      ]) as never,
    );

    render(<ReportLibraryTab />);

    expect(await screen.findByText(REPORTS_LIBRARY.ORIGIN.SCHEDULED)).toBeInTheDocument();
    expect(screen.getByText('3.00 MB')).toBeInTheDocument();
  });
});
