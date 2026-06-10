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
import { ERP_MAPPING } from '@/constants/ConstantsAndParams';
import type { ErpFieldMappingDrawerProps } from '@/models/interfaces/components/DrawerProps';
import ErpFieldMappingService from '@/services/ErpFieldMappingService';
import { NotificationUtils } from '@/utils/NotificationUtils';

export type { ErpFieldMappingDrawerProps } from '@/models/interfaces/components/DrawerProps';

const { Text } = Typography;

type EditableMapping = {
  key: string;
  njField: string;
  erpField: string;
  dataType: string;
  required: boolean;
};

/**
 * Side drawer that loads the current ERP field mapping for the
 * PRODUCTION_ORDER entity type and lets the Manager rewrite the
 * ERP-side column names atomically (EP-FE-06 sub-task 9). The save
 * goes through PUT /erp/field-mapping; the backend AuditFilter
 * captures the diff (RN12, RF20). Adding/removing mapping rows is
 * out of scope for the MVP - this drawer only edits the ERP column
 * binding of the existing rows shipped via V9.
 */
export function ErpFieldMappingDrawer({ open, onClose, onSaved }: ErpFieldMappingDrawerProps) {
  const [rows, setRows] = useState<EditableMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const updateRow = (key: string, patch: Partial<EditableMapping>) => {
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

  const columns: ColumnsType<EditableMapping> = [
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
      size={640}
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
        <Table<EditableMapping>
          rowKey={(record) => record.key}
          dataSource={rows}
          columns={columns}
          loading={loading}
          pagination={false}
        />
      </Form>
    </Drawer>
  );
}