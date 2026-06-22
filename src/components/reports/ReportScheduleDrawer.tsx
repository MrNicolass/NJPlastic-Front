'use client';

import { Button, Drawer, Form, Input, Select, Space, Typography } from 'antd';
import { useState } from 'react';
import { LAYOUT, REPORTS_SCHEDULE } from '@/constants/ConstantsAndParams';
import { useResponsive } from '@/hooks/useResponsive';
import type {
  ReportFormat,
  ReportScheduleRequest,
  ReportType,
} from '@/models/types/ReportTypes';
import ReportsService from '@/services/ReportsService';
import { NotificationUtils } from '@/utils/NotificationUtils';
import { getResponsiveDrawerWidth } from '@/utils/ResponsiveUtils';

const { Text } = Typography;

const CRON_REGEX = /^([0-9*/,?-]+ ){5}[0-9*/,?A-Z-]+$/;

type ReportScheduleDrawerProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

type FormValues = {
  type: ReportType;
  format: ReportFormat;
  cron: string;
  deliveryEmail: string;
  params?: string;
};

/**
 * Manager-only drawer used to create a new report schedule. Client-side
 * validation covers cron shape and JSON parsing of the params field; the
 * backend remains the source of truth for cron correctness.
 */
export function ReportScheduleDrawer({ open, onClose, onCreated }: ReportScheduleDrawerProps) {
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);
  const { isMobile } = useResponsive();

  const handleSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const payload: ReportScheduleRequest = {
        type: values.type,
        format: values.format,
        cron: values.cron.trim(),
        deliveryEmail: values.deliveryEmail.trim(),
        params: values.params?.trim() || undefined,
      };
      await ReportsService.createSchedule(payload, true);
      NotificationUtils({
        key: REPORTS_SCHEDULE.NOTIFICATIONS.SUCCESS.KEYS.CREATED,
        type: 'success',
        message: REPORTS_SCHEDULE.NOTIFICATIONS.SUCCESS.TITLES.CREATED,
        description: REPORTS_SCHEDULE.NOTIFICATIONS.SUCCESS.MESSAGES.CREATED,
      });
      form.resetFields();
      onCreated();
    } catch {
      NotificationUtils({
        key: REPORTS_SCHEDULE.NOTIFICATIONS.ERROR.KEYS.CREATE_FAILED,
        type: 'error',
        message: REPORTS_SCHEDULE.NOTIFICATIONS.ERROR.TITLES.CREATE_FAILED,
        description: REPORTS_SCHEDULE.NOTIFICATIONS.ERROR.MESSAGES.CREATE_FAILED,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={REPORTS_SCHEDULE.DRAWER.TITLE}
      width={getResponsiveDrawerWidth(isMobile, LAYOUT.RESPONSIVE_WIDTHS.DRAWER_SM)}
      destroyOnClose
      footer={
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>{REPORTS_SCHEDULE.DRAWER.CANCEL_BUTTON}</Button>
          <Button type="primary" loading={submitting} onClick={() => form.submit()}>
            {REPORTS_SCHEDULE.DRAWER.SUBMIT_BUTTON}
          </Button>
        </Space>
      }
    >
      <Form<FormValues>
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ format: 'CSV' as ReportFormat }}
      >
        <Form.Item
          name="type"
          label={REPORTS_SCHEDULE.DRAWER.LABELS.TYPE}
          rules={[{ required: true, message: REPORTS_SCHEDULE.DRAWER.VALIDATION.TYPE_REQUIRED }]}
        >
          <Select options={[...REPORTS_SCHEDULE.TYPE_OPTIONS]} />
        </Form.Item>

        <Form.Item
          name="format"
          label={REPORTS_SCHEDULE.DRAWER.LABELS.FORMAT}
          rules={[{ required: true, message: REPORTS_SCHEDULE.DRAWER.VALIDATION.FORMAT_REQUIRED }]}
          help={REPORTS_SCHEDULE.DRAWER.HELP.FORMAT_PDF_DISABLED}
        >
          <Select options={[...REPORTS_SCHEDULE.FORMAT_OPTIONS]} />
        </Form.Item>

        <Form.Item
          name="cron"
          label={REPORTS_SCHEDULE.DRAWER.LABELS.CRON}
          rules={[
            { required: true, message: REPORTS_SCHEDULE.DRAWER.VALIDATION.CRON_REQUIRED },
            {
              validator: (_, value: string) => {
                if (!value || CRON_REGEX.test(value.trim())) {
                  return Promise.resolve();
                }
                return Promise.reject(REPORTS_SCHEDULE.DRAWER.VALIDATION.CRON_INVALID);
              },
            },
          ]}
          help={REPORTS_SCHEDULE.DRAWER.HELP.CRON}
        >
          <Input placeholder={REPORTS_SCHEDULE.DRAWER.PLACEHOLDERS.CRON} />
        </Form.Item>

        <Form.Item
          name="deliveryEmail"
          label={REPORTS_SCHEDULE.DRAWER.LABELS.EMAIL}
          rules={[
            { required: true, message: REPORTS_SCHEDULE.DRAWER.VALIDATION.EMAIL_REQUIRED },
            { type: 'email', message: REPORTS_SCHEDULE.DRAWER.VALIDATION.EMAIL_INVALID },
          ]}
        >
          <Input placeholder={REPORTS_SCHEDULE.DRAWER.PLACEHOLDERS.EMAIL} />
        </Form.Item>

        <Form.Item
          name="params"
          label={REPORTS_SCHEDULE.DRAWER.LABELS.PARAMS}
          rules={[
            {
              validator: (_, value?: string) => {
                if (!value || !value.trim()) {
                  return Promise.resolve();
                }
                try {
                  JSON.parse(value);
                  return Promise.resolve();
                } catch {
                  return Promise.reject(REPORTS_SCHEDULE.DRAWER.VALIDATION.PARAMS_INVALID);
                }
              },
            },
          ]}
        >
          <Input.TextArea rows={4} placeholder={REPORTS_SCHEDULE.DRAWER.PLACEHOLDERS.PARAMS} />
        </Form.Item>

        <Text type="secondary">{REPORTS_SCHEDULE.DRAWER.HELP.PARAMS}</Text>
      </Form>
    </Drawer>
  );
}
