'use client';

import { Button, DatePicker, Form, InputNumber, Modal, Space, Typography } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { MACHINES } from '@/constants/ConstantsAndParams';
import type { RegisterQualityModalProps } from '@/models/interfaces/components/ModalProps';
import type { RegisterQualityFormValues as FormValues } from '@/models/types/RegisterQualityFormValues';
import MachineService from '@/services/MachineService';
import { NotificationUtils } from '@/utils/NotificationUtils';

export type { RegisterQualityModalProps } from '@/models/interfaces/components/ModalProps';

const { Paragraph, Text } = Typography;

const DEFAULT_WINDOW_HOURS = 8;

const resolveDefaultRange = (defaultFrom?: string, defaultTo?: string): [Dayjs, Dayjs] => {
  if (defaultFrom && defaultTo) {
    return [dayjs(defaultFrom), dayjs(defaultTo)];
  }
  const end = dayjs();
  const start = end.subtract(DEFAULT_WINDOW_HOURS, 'hour');
  return [start, end];
};

/**
 * Manual entry of the Quality factor that closes the OEE calculation
 * (RF10). Defaults the period to the active production order window
 * when known, or to the last 8 hours otherwise. Validates client-side
 * that `totalCount >= goodCount > 0` and that the period is well
 * ordered before the request reaches the backend.
 *
 * Reused across roles even though it is currently triggered only from
 * the machine detail screen of EP-FE-04.
 */
export function RegisterQualityModal(props: RegisterQualityModalProps): React.ReactNode {
  const { open, onClose, machineId, machineCode, defaultFrom, defaultTo, onRegistered } = props;
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    form.setFieldsValue({
      goodCount: undefined as unknown as number,
      totalCount: undefined as unknown as number,
      range: resolveDefaultRange(defaultFrom, defaultTo),
    });
  }, [open, machineId, defaultFrom, defaultTo, form]);

  const handleFinish = async (values: FormValues) => {
    if (!values.range || values.range.length !== 2) {
      return;
    }
    const [start, end] = values.range;
    if (!start.isBefore(end)) {
      form.setFields([
        {
          name: 'range',
          errors: [MACHINES.QUALITY.REGISTER_MODAL.VALIDATION_MESSAGES.PERIOD_INVERTED],
        },
      ]);
      return;
    }
    setSubmitting(true);
    try {
      await MachineService.registerQuality(machineId, {
        machineId,
        goodCount: values.goodCount,
        totalCount: values.totalCount,
        periodStart: start.toISOString(),
        periodEnd: end.toISOString(),
      });
      onRegistered?.();
      onClose();
    } catch (error) {
      NotificationUtils({
        key: MACHINES.NOTIFICATIONS.ERROR.KEYS.QUALITY_FAILED,
        type: 'error',
        message: MACHINES.NOTIFICATIONS.ERROR.TITLES.QUALITY_FAILED,
        description: MACHINES.NOTIFICATIONS.ERROR.MESSAGES.QUALITY_FAILED,
      });
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Failed to register quality', error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={MACHINES.QUALITY.REGISTER_MODAL.TITLE}
      width={520}
      destroyOnHidden
      footer={
        <Space>
          <Button onClick={onClose} disabled={submitting}>
            {MACHINES.QUALITY.REGISTER_MODAL.BUTTONS.CANCEL}
          </Button>
          <Button type="primary" loading={submitting} onClick={() => form.submit()}>
            {MACHINES.QUALITY.REGISTER_MODAL.BUTTONS.SAVE}
          </Button>
        </Space>
      }
    >
      <Space orientation="vertical" size={12} style={{ width: '100%' }}>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {MACHINES.QUALITY.REGISTER_MODAL.SUBTITLE}
        </Paragraph>
        <Paragraph style={{ marginBottom: 0 }}>
          <Text strong>{MACHINES.QUALITY.REGISTER_MODAL.LABELS.MACHINE}:</Text>{' '}
          <Text code>{machineCode}</Text>
        </Paragraph>

        <Form<FormValues> form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="goodCount"
            label={MACHINES.QUALITY.REGISTER_MODAL.LABELS.GOOD_COUNT}
            rules={[
              {
                required: true,
                message: MACHINES.QUALITY.REGISTER_MODAL.VALIDATION_MESSAGES.GOOD_REQUIRED,
              },
              {
                type: 'number',
                min: 0,
                message: MACHINES.QUALITY.REGISTER_MODAL.VALIDATION_MESSAGES.GOOD_NEGATIVE,
              },
            ]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder={MACHINES.QUALITY.REGISTER_MODAL.PLACEHOLDERS.GOOD_COUNT}
            />
          </Form.Item>

          <Form.Item
            name="totalCount"
            label={MACHINES.QUALITY.REGISTER_MODAL.LABELS.TOTAL_COUNT}
            dependencies={['goodCount']}
            rules={[
              {
                required: true,
                message: MACHINES.QUALITY.REGISTER_MODAL.VALIDATION_MESSAGES.TOTAL_REQUIRED,
              },
              {
                type: 'number',
                min: 0,
                message: MACHINES.QUALITY.REGISTER_MODAL.VALIDATION_MESSAGES.TOTAL_NEGATIVE,
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const good = Number(getFieldValue('goodCount') ?? 0);
                  if (typeof value === 'number' && value < good) {
                    return Promise.reject(
                      new Error(
                        MACHINES.QUALITY.REGISTER_MODAL.VALIDATION_MESSAGES.TOTAL_BELOW_GOOD,
                      ),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder={MACHINES.QUALITY.REGISTER_MODAL.PLACEHOLDERS.TOTAL_COUNT}
            />
          </Form.Item>

          <Form.Item
            name="range"
            label={MACHINES.QUALITY.REGISTER_MODAL.LABELS.FROM}
            rules={[
              {
                required: true,
                message: MACHINES.QUALITY.REGISTER_MODAL.VALIDATION_MESSAGES.PERIOD_REQUIRED,
              },
            ]}
            extra={MACHINES.QUALITY.REGISTER_MODAL.HELPER}
          >
            <DatePicker.RangePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Space>
    </Modal>
  );
}
