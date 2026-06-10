'use client';

import { Button, Result, Typography } from 'antd';
import { ERROR_BOUNDARY } from '@/constants/ConstantsAndParams';

const { Paragraph, Text } = Typography;

type FallbackErrorProps = {
  error?: Error;
  onReload?: () => void;
};

/**
 * Render the user-facing fallback when {@link GlobalErrorBoundary} traps an
 * unrecoverable render error. The reload button defaults to a full page
 * reload but accepts an override for unit tests and in-tree retries.
 */
export function FallbackError({ error, onReload }: FallbackErrorProps) {
  const handleReload = () => {
    if (onReload) {
      onReload();
      return;
    }
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <Result
      status="500"
      title={ERROR_BOUNDARY.TITLE}
      subTitle={ERROR_BOUNDARY.DESCRIPTION}
      extra={
        <Button type="primary" onClick={handleReload}>
          {ERROR_BOUNDARY.RELOAD_BUTTON}
        </Button>
      }
    >
      {error && process.env.NODE_ENV !== 'production' ? (
        <Paragraph>
          <Text strong>{ERROR_BOUNDARY.DETAILS_LABEL}:</Text>
          <br />
          <Text code>{error.message}</Text>
        </Paragraph>
      ) : null}
    </Result>
  );
}
