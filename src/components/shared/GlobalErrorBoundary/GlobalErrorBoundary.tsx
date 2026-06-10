'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { GENERIC_NOTIFICATIONS } from '@/constants/ConstantsAndParams';
import { NotificationUtils } from '@/utils/NotificationUtils';
import { FallbackError } from './FallbackError';

type GlobalErrorBoundaryProps = {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
};

type GlobalErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

/**
 * React error boundary mounted at the root of the authenticated layout (and
 * a thinner instance at the app root) to keep a render-time crash from
 * unmounting the whole tree. Logs the error, emits a generic notification
 * and shows {@link FallbackError} with a reload action. A custom fallback
 * may be passed for scoped boundaries inside specific routes.
 */
export class GlobalErrorBoundary extends Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): GlobalErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[GlobalErrorBoundary]', error, info.componentStack);
    NotificationUtils({
      key: GENERIC_NOTIFICATIONS.KEYS.GENERIC_ERROR,
      defaultType: 'GENERIC_ERROR',
    });
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }
    if (this.props.fallback && this.state.error) {
      return this.props.fallback(this.state.error, this.reset);
    }
    return <FallbackError error={this.state.error ?? undefined} />;
  }
}
