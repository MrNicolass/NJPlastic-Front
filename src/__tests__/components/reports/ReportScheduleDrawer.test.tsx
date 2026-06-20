import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { REPORTS_SCHEDULE } from '@/constants/ConstantsAndParams';

// jsdom does not implement these APIs, which antd's Drawer/Form/Select observe.
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
  // React 19's Portal in antd's Drawer/Form requires MessageChannel for scheduling.
  if (typeof (globalThis as { MessageChannel?: unknown }).MessageChannel === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    (globalThis as unknown as { MessageChannel: unknown }).MessageChannel = require('worker_threads').MessageChannel;
  }
});

jest.mock('@/services/ReportsService', () => ({
  __esModule: true,
  default: {
    createSchedule: jest.fn(),
  },
}));

jest.mock('@/utils/NotificationUtils', () => ({
  __esModule: true,
  NotificationUtils: jest.fn(),
}));

import ReportsService from '@/services/ReportsService';
import { NotificationUtils } from '@/utils/NotificationUtils';
import { ReportScheduleDrawer } from '@/components/reports/ReportScheduleDrawer';

const mockedService = ReportsService as jest.Mocked<typeof ReportsService>;
const mockedNotificationUtils = NotificationUtils as jest.Mock;

describe('ReportScheduleDrawer', () => {
  beforeEach(() => {
    mockedService.createSchedule.mockReset();
    mockedNotificationUtils.mockClear();
  });

  it('renders the drawer with the form labels when open', () => {
    render(<ReportScheduleDrawer open onClose={jest.fn()} onCreated={jest.fn()} />);

    expect(screen.getByText(REPORTS_SCHEDULE.DRAWER.TITLE)).toBeInTheDocument();
    expect(screen.getByText(REPORTS_SCHEDULE.DRAWER.LABELS.TYPE)).toBeInTheDocument();
    expect(screen.getByText(REPORTS_SCHEDULE.DRAWER.LABELS.CRON)).toBeInTheDocument();
    expect(screen.getByText(REPORTS_SCHEDULE.DRAWER.LABELS.EMAIL)).toBeInTheDocument();
  });

  it('invokes onClose when the cancel button is clicked', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();

    render(<ReportScheduleDrawer open onClose={onClose} onCreated={jest.fn()} />);
    await user.click(screen.getByRole('button', { name: REPORTS_SCHEDULE.DRAWER.CANCEL_BUTTON }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows validation messages when the required fields are missing', async () => {
    const user = userEvent.setup();

    render(<ReportScheduleDrawer open onClose={jest.fn()} onCreated={jest.fn()} />);
    await user.click(screen.getByRole('button', { name: REPORTS_SCHEDULE.DRAWER.SUBMIT_BUTTON }));

    expect(await screen.findByText(REPORTS_SCHEDULE.DRAWER.VALIDATION.CRON_REQUIRED)).toBeInTheDocument();
    expect(screen.getByText(REPORTS_SCHEDULE.DRAWER.VALIDATION.EMAIL_REQUIRED)).toBeInTheDocument();
    expect(mockedService.createSchedule).not.toHaveBeenCalled();
  });

  it('rejects an invalid cron expression', async () => {
    const user = userEvent.setup();

    render(<ReportScheduleDrawer open onClose={jest.fn()} onCreated={jest.fn()} />);
    await user.type(
      screen.getByPlaceholderText(REPORTS_SCHEDULE.DRAWER.PLACEHOLDERS.CRON),
      'not-a-cron',
    );
    await user.click(screen.getByRole('button', { name: REPORTS_SCHEDULE.DRAWER.SUBMIT_BUTTON }));

    expect(await screen.findByText(REPORTS_SCHEDULE.DRAWER.VALIDATION.CRON_INVALID)).toBeInTheDocument();
  });

  it('rejects invalid JSON in the params field', async () => {
    const user = userEvent.setup();

    render(<ReportScheduleDrawer open onClose={jest.fn()} onCreated={jest.fn()} />);
    await user.type(
      screen.getByPlaceholderText(REPORTS_SCHEDULE.DRAWER.PLACEHOLDERS.PARAMS),
      '{ not json',
    );
    await user.click(screen.getByRole('button', { name: REPORTS_SCHEDULE.DRAWER.SUBMIT_BUTTON }));

    expect(await screen.findByText(REPORTS_SCHEDULE.DRAWER.VALIDATION.PARAMS_INVALID)).toBeInTheDocument();
  });
});
