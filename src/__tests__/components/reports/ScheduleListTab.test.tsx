import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { REPORTS_SCHEDULE } from '@/constants/ConstantsAndParams';

// jsdom does not implement these APIs, which antd's Table/Popconfirm observe.
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
    listSchedules: jest.fn(),
    deleteSchedule: jest.fn(),
  },
}));

jest.mock('@/utils/NotificationUtils', () => ({
  __esModule: true,
  NotificationUtils: jest.fn(),
}));

jest.mock('@/components/reports/ReportScheduleDrawer', () => ({
  __esModule: true,
  ReportScheduleDrawer: ({
    open,
    onClose,
    onCreated,
  }: {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
  }) =>
    open ? (
      <div data-testid="drawer">
        <button onClick={onClose}>drawer-close</button>
        <button onClick={onCreated}>drawer-created</button>
      </div>
    ) : null,
}));

import ReportsService from '@/services/ReportsService';
import { NotificationUtils } from '@/utils/NotificationUtils';
import { ScheduleListTab } from '@/components/reports/ScheduleListTab';

const mockedService = ReportsService as jest.Mocked<typeof ReportsService>;
const mockedNotificationUtils = NotificationUtils as jest.Mock;

describe('ScheduleListTab', () => {
  beforeEach(() => {
    mockedService.listSchedules.mockReset();
    mockedService.deleteSchedule.mockReset();
    mockedNotificationUtils.mockClear();
  });

  it('lists schedules returned by the service', async () => {
    mockedService.listSchedules.mockResolvedValueOnce([
      {
        id: 's1',
        type: 'SHIFT',
        params: null,
        cron: '0 0 7 * * MON-FRI',
        deliveryEmail: 'manager@empresa.com',
        format: 'CSV',
        active: true,
        createdBy: 'u1',
        createdAt: '2026-06-10T10:00:00Z',
      },
    ] as never);

    render(<ScheduleListTab />);

    expect(await screen.findByText('SHIFT')).toBeInTheDocument();
    expect(screen.getByText('0 0 7 * * MON-FRI')).toBeInTheDocument();
    expect(screen.getByText('manager@empresa.com')).toBeInTheDocument();
  });

  it('opens the schedule drawer when the new button is clicked', async () => {
    mockedService.listSchedules.mockResolvedValueOnce([] as never);
    const user = userEvent.setup();

    render(<ScheduleListTab />);
    await waitFor(() => expect(mockedService.listSchedules).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: REPORTS_SCHEDULE.NEW_BUTTON }));

    expect(screen.getByTestId('drawer')).toBeInTheDocument();
  });

  it('reloads the schedule list when the drawer reports a created entry', async () => {
    mockedService.listSchedules.mockResolvedValue([] as never);
    const user = userEvent.setup();

    render(<ScheduleListTab />);
    await waitFor(() => expect(mockedService.listSchedules).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole('button', { name: REPORTS_SCHEDULE.NEW_BUTTON }));
    await user.click(screen.getByRole('button', { name: 'drawer-created' }));

    await waitFor(() => {
      expect(mockedService.listSchedules).toHaveBeenCalledTimes(2);
    });
  });

  it('emits an error notification when the listing call fails', async () => {
    mockedService.listSchedules.mockRejectedValueOnce(new Error('500'));

    render(<ScheduleListTab />);

    await waitFor(() => {
      expect(mockedNotificationUtils).toHaveBeenCalledWith(
        expect.objectContaining({
          key: REPORTS_SCHEDULE.NOTIFICATIONS.ERROR.KEYS.LIST_FAILED,
          type: 'error',
        }),
      );
    });
  });
});
