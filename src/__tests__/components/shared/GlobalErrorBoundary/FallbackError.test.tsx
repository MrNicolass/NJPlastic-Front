import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ERROR_BOUNDARY } from '@/constants/ConstantsAndParams';
import { FallbackError } from '@/components/shared/GlobalErrorBoundary/FallbackError';

describe('FallbackError', () => {
  it('renders the boundary title, description and reload button', () => {
    render(<FallbackError />);

    expect(screen.getByText(ERROR_BOUNDARY.TITLE)).toBeInTheDocument();
    expect(screen.getByText(ERROR_BOUNDARY.DESCRIPTION)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ERROR_BOUNDARY.RELOAD_BUTTON })).toBeInTheDocument();
  });

  it('shows the error message in dev when an error is supplied', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    try {
      render(<FallbackError error={new Error('boom went the dynamite')} />);
      expect(screen.getByText(ERROR_BOUNDARY.DETAILS_LABEL + ':')).toBeInTheDocument();
      expect(screen.getByText('boom went the dynamite')).toBeInTheDocument();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('hides the error message in production even when an error is supplied', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      render(<FallbackError error={new Error('hidden detail')} />);
      expect(screen.queryByText('hidden detail')).not.toBeInTheDocument();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('invokes the onReload handler when the reload button is clicked', async () => {
    const user = userEvent.setup();
    const onReload = jest.fn();

    render(<FallbackError onReload={onReload} />);
    await user.click(screen.getByRole('button', { name: ERROR_BOUNDARY.RELOAD_BUTTON }));

    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it('does not throw when the reload button is clicked without an onReload prop', async () => {
    // jsdom marks `window.location` and `location.reload` as non-configurable
    // in this stack, so we cannot redefine reload to assert the call. Instead
    // we verify the fallback path runs without throwing.
    const user = userEvent.setup();

    render(<FallbackError />);

    await expect(
      user.click(screen.getByRole('button', { name: ERROR_BOUNDARY.RELOAD_BUTTON })),
    ).resolves.not.toThrow();
  });
});
