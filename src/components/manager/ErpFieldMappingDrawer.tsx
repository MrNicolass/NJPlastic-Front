'use client';

import {
  Alert,
  Button,
  Drawer,
  Form,
  Input,
  Space,
  Switch,
  Table,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import type { Schemas } from '@/api/types';
import { ERP_MAPPING, LAYOUT } from '@/constants/ConstantsAndParams';
import { useResponsive } from '@/hooks/useResponsive';
import type { ErpFieldMappingDrawerProps } from '@/models/interfaces/components/DrawerProps';
import type { EditableErpFieldMapping } from '@/models/types/EditableErpFieldMapping';
import ErpFieldMappingService from '@/services/ErpFieldMappingService';
import { NotificationUtils } from '@/utils/NotificationUtils';
import { getResponsiveDrawerWidth } from '@/utils/ResponsiveUtils';

export type { ErpFieldMappingDrawerProps } from '@/models/interfaces/components/DrawerProps';

const { Text } = Typography;

/**
 * Side drawer that loads the current ERP field mapping for the
 * PRODUCTION_ORDER entity type and lets the Manager rewrite the ERP-side
 * column names atomically. The save goes through PUT /erp/field-mapping;
 * the backend AuditFilter captures the diff. Adding/removing mapping rows
 * is out of scope for the MVP - this drawer only edits the ERP column
 * binding of the existing rows.
 */
export function ErpFieldMappingDrawer({ open, onClose, onSaved }: ErpFieldMappingDrawerProps) {
  const [rows, setRows] = useState<EditableErpFieldMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { isMobile } = useResponsive();

  useEffect(() => {
    if (!open) {
      return;
    }
    setLoading(true);
    ErpFieldMappingService.getMapping(ERP_MAPPING.DRAWER.ENTITY_TYPE, true)
      .then((result) => {
        setRows(
          result.map((row) => ({
            key: row.id ?? row.njField,
            njField: row.njField,
            erpField: row.erpField,
            dataType: row.dataType,
            required: row.required,
          })),
        );
      })
      .catch(() => {
        NotificationUtils({
          key: ERP_MAPPING.NOTIFICATIONS.ERROR.KEYS.LOAD_FAILED,
          type: 'error',
          message: ERP_MAPPING.NOTIFICATIONS.ERROR.TITLES.LOAD_FAILED,
          description: ERP_MAPPING.NOTIFICATIONS.ERROR.MESSAGES.LOAD_FAILED,
        });
      })
      .finally(() => setLoading(false));
  }, [open]);

  const updateRow = (key: string, patch: Partial<EditableErpFieldMapping>) => {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  };

  const handleSave = async () => {
    const empty = rows.find((row) => row.erpField.trim().length === 0);
    if (empty) {
      NotificationUtils({
        key: ERP_MAPPING.NOTIFICATIONS.ERROR.KEYS.UPDATE_FAILED,
        type: 'warning',
        message: ERP_MAPPING.NOTIFICATIONS.ERROR.TITLES.UPDATE_FAILED,
        description: ERP_MAPPING.DRAWER.VALIDATION_MESSAGES.COLUMN_REQUIRED,
      });
      return;
    }
    const payload: Schemas['ErpFieldMappingUpdateRequestDTO'] = {
      entityType: ERP_MAPPING.DRAWER.ENTITY_TYPE,
      mappings: rows.map((row) => ({
        njField: row.njField,
        erpField: row.erpField.trim(),
        dataType: row.dataType,
        required: row.required,
      })),
    };
    setSaving(true);
    try {
      await ErpFieldMappingService.replaceMapping(payload);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<EditableErpFieldMapping> = [
    {
      title: ERP_MAPPING.DRAWER.LABELS.NJ_FIELD,
      dataIndex: ERP_MAPPING.DRAWER.KEYS.NJ_FIELD,
      key: ERP_MAPPING.DRAWER.KEYS.NJ_FIELD,
      render: (_value, record) => <Text strong>{record.njField}</Text>,
    },
    {
      title: ERP_MAPPING.DRAWER.LABELS.ERP_COLUMN,
      dataIndex: ERP_MAPPING.DRAWER.KEYS.ERP_COLUMN,
      key: ERP_MAPPING.DRAWER.KEYS.ERP_COLUMN,
      render: (_value, record) => (
        <Input
          value={record.erpField}
          placeholder={ERP_MAPPING.DRAWER.PLACEHOLDERS.ERP_COLUMN}
          onChange={(event) => updateRow(record.key, { erpField: event.target.value })}
        />
      ),
    },
    {
      title: ERP_MAPPING.DRAWER.LABELS.DESCRIPTION,
      dataIndex: ERP_MAPPING.DRAWER.KEYS.DESCRIPTION,
      key: ERP_MAPPING.DRAWER.KEYS.DESCRIPTION,
      render: (_value, record) => (
        <Space>
          <Text type="secondary">{record.dataType}</Text>
          <Switch
            checked={record.required}
            onChange={(checked) => updateRow(record.key, { required: checked })}
          />
        </Space>
      ),
    },
  ];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={ERP_MAPPING.DRAWER.TITLE}
      width={getResponsiveDrawerWidth(isMobile, LAYOUT.RESPONSIVE_WIDTHS.DRAWER_MD)}
      destroyOnHidden
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={onClose}>{ERP_MAPPING.DRAWER.BUTTONS.CANCEL}</Button>
          <Button type="primary" loading={saving} onClick={handleSave}>
            {ERP_MAPPING.DRAWER.BUTTONS.SAVE}
          </Button>
        </Space>
      }
    >
      <Form layout="vertical">
        <Alert
          type="info"
          showIcon
          title={ERP_MAPPING.DRAWER.SUBTITLE}
          style={{ marginBottom: 16 }}
        />
        <Table<EditableErpFieldMapping>
          rowKey={(record) => record.key}
          dataSource={rows}
          columns={columns}
          loading={loading}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </Form>
    </Drawer>
  );
}