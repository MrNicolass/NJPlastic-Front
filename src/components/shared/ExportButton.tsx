'use client';

import { DownloadOutlined } from '@ant-design/icons';
import { Dropdown, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import { EXPORT } from '@/constants/ConstantsAndParams';

export type ExportFormat = 'csv' | 'pdf';

type ExportButtonProps = {
  onExport: (format: ExportFormat) => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  tooltip?: string;
  csvOnly?: boolean;
};

/**
 * Dropdown button offering CSV / PDF export. Visual gating (disabled,
 * loading, tooltip) is handled here; the parent decides which dataset is
 * exported when {@link onExport} fires. When {@code csvOnly} is true the
 * PDF item is hidden - used for endpoints that the backend serializes
 * only as CSV today (e.g. Shift Report generation via scheduler).
 */
export function ExportButton({
  onExport,
  disabled,
  loading,
  tooltip,
  csvOnly,
}: ExportButtonProps) {
  const items: NonNullable<MenuProps['items']> = [
    {
      key: 'csv',
      label: EXPORT.FORMAT_CSV,
      onClick: () => void onExport('csv'),
    },
  ];
  if (!csvOnly) {
    items.push({
      key: 'pdf',
      label: EXPORT.FORMAT_PDF,
      onClick: () => void onExport('pdf'),
    });
  }

  const button = (
    <Dropdown.Button
      menu={{ items }}
      disabled={disabled}
      loading={loading}
      icon={<DownloadOutlined />}
      onClick={() => void onExport('csv')}
    >
      <DownloadOutlined /> {EXPORT.BUTTON_LABEL}
    </Dropdown.Button>
  );

  if (tooltip) {
    return <Tooltip title={tooltip}>{button}</Tooltip>;
  }
  return button;
}
