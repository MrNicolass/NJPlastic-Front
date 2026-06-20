import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('@/utils/NotificationUtils', () => ({
  __esModule: true,
  NotificationUtils: jest.fn(),
}));

import { NotificationUtils } from '@/utils/NotificationUtils';
import { GENERIC_NOTIFICATIONS, ERROR_BOUNDARY } from '@/constants/ConstantsAndParams';
import { GlobalErrorBoundary } from '@/components/shared/GlobalErrorBoundary/GlobalErrorBoundary';

const mockedNotificationUtils = NotificationUtils as jest.Mock;

const Boom = ({ message }: { message: string }) => {
  throw new Error(message);
};

describe('GlobalErrorBoundary', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedNotificationUtils.mockClear();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders children when no error is thrown', () => {
    render(
      <GlobalErrorBoundary>
        <span data-testid="child">ok</span>
      </GlobalErrorBoundary>,
    );

    expect(screen.getByTestId('child')).toHaveTextContent('ok');
  });

  it('renders the FallbackError when a child throws and emits a generic notification', () => {
    render(
      <GlobalErrorBoundary>
        <Boom message="kaboom" />
      </GlobalErrorBoundary>,
    );

    expect(screen.getByText(ERROR_BOUNDARY.TITLE)).toBeInTheDocument();
    expect(mockedNotificationUtils).toHaveBeenCalledWith({
      key: GENERIC_NOTIFICATIONS.KEYS.GENERIC_ERROR,
      defaultType: 'GENERIC_ERROR',
    });
  });

  it('renders a custom fallback when supplied and the reset function clears the error', async () => {
    const user = userEvent.setup();
    const fallback = (error: Error, reset: () => void) => (
      <div>
        <span data-testid="custom">{error.message}</span>
        <button onClick={reset}>retry</button>
      </div>
    );

    let shouldThrow = true;
    const Child = () => {
      if (shouldThrow) {
        throw new Error('crash');
      }
      return <span data-testid="recovered">recovered</span>;
    };

    render(
      <GlobalErrorBoundary fallback={fallback}>
        <Child />
      </GlobalErrorBoundary>,
    );

    expect(screen.getByTestId('custom')).toHaveTextContent('crash');

    shouldThrow = false;
    await user.click(screen.getByRole('button', { name: 'retry' }));

    expect(screen.getByTestId('recovered')).toHaveTextContent('recovered');
  });
});
