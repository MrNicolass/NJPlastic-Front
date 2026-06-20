'use client';

import { DatePicker, Form, Input, Modal, Select, Typography } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import type { Schemas } from '@/api/types';
import { EVENTS } from '@/constants/ConstantsAndParams';
import type { RegisterEventModalProps } from '@/models/interfaces/components/ModalProps';
import type { EventTypeKey, RegisterEventFormValues } from '@/models/types/RegisterEventFormValues';
import MachineService from '@/services/MachineService';
import ProductionEventService from '@/services/ProductionEventService';

export type { RegisterEventModalProps } from '@/models/interfaces/components/ModalProps';

const { Text } = Typography;

const DESCRIPTION_MAX = 500;

const TYPE_OPTIONS = (Object.keys(EVENTS.TYPES) as EventTypeKey[]).map((key) => ({
  value: key,
  label: EVENTS.TYPE_LABELS[key],
}));

/**
 * Header CTA modal of the Leader dashboard (item 7). Backed by
 * {@code POST /events}; the success callback chains into
 * {@code RecentEventsPanel.refetch} so the new entry surfaces immediately
 * without a 15s wait. Machines are pulled from {@code GET /machines}, which
 * is already sector-scoped server-side.
 */
export function RegisterEventModal({ open, onClose, onRegistered }: RegisterEventModalProps) {
  const [form] = Form.useForm<RegisterEventFormValues>();
  const [machines, setMachines] = useState<Schemas['MachineSummaryDTO'][]>([]);
  const [machinesLoading, setMachinesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    let cancelled = false;
    setMachinesLoading(true);
    MachineService.listMachines(true)
      .then((list) => {
        if (!cancelled) {
          setMachines(list);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMachines([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setMachinesLoading(false);
        }
      });
    form.setFieldsValue({
      startedAt: dayjs(),
      endedAt: null,
    } as RegisterEventFormValues);
    return () => {
      cancelled = true;
    };
  }, [open, form]);

  const handleCancel = useCallback(() => {
    form.resetFields();
    onClose();
  }, [form, onClose]);

  const handleOk = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const payload: Schemas['EventRequestDTO'] = {
        machineId: values.machineId,
        type: values.type,
        description: values.description?.trim() ? values.description : undefined,
        startedAt: values.startedAt.toISOString(),
        endedAt: values.endedAt ? values.endedAt.toISOString() : undefined,
      };
      await ProductionEventService.registerEvent(payload);
      form.resetFields();
      onClose();
      onRegistered?.();
    } catch (error) {
 // Validation errors are surfaced inline by AntD; HTTP errors come through
 // the Axios interceptor as a notification. No extra handling needed here.
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return;
      }
    } finally {
      setSubmitting(false);
    }
  }, [form, onClose, onRegistered]);

  return (
    <Modal
      open={open}
      title={EVENTS.REGISTER_MODAL.TITLE}
      okText={EVENTS.REGISTER_MODAL.BUTTONS.SAVE}
      cancelText={EVENTS.REGISTER_MODAL.BUTTONS.CANCEL}
      onCancel={handleCancel}
      onOk={handleOk}
      confirmLoading={submitting}
      destroyOnHidden
    >
      <Text type="secondary">{EVENTS.REGISTER_MODAL.SUBTITLE}</Text>
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
        initialValues={{ startedAt: dayjs(), endedAt: null }}
      >
        <Form.Item
          name="machineId"
          label={EVENTS.REGISTER_MODAL.LABELS.MACHINE}
          rules={[{ required: true, message: EVENTS.REGISTER_MODAL.VALIDATION_MESSAGES.MACHINE_REQUIRED }]}
        >
          <Select
            loading={machinesLoading}
            placeholder={EVENTS.REGISTER_MODAL.PLACEHOLDERS.MACHINE}
            options={machines.map((m) => ({ value: m.id, label: `${m.code} - ${m.description ?? ''}` }))}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
        <Form.Item
          name="type"
          label={EVENTS.REGISTER_MODAL.LABELS.TYPE}
          rules={[{ required: true, message: EVENTS.REGISTER_MODAL.VALIDATION_MESSAGES.TYPE_REQUIRED }]}
        >
          <Select placeholder={EVENTS.REGISTER_MODAL.PLACEHOLDERS.TYPE} options={TYPE_OPTIONS} />
        </Form.Item>
        <Form.Item
          name="description"
          label={EVENTS.REGISTER_MODAL.LABELS.DESCRIPTION}
          rules={[
            {
              max: DESCRIPTION_MAX,
              message: EVENTS.REGISTER_MODAL.VALIDATION_MESSAGES.DESCRIPTION_MAX_LENGTH(DESCRIPTION_MAX),
            },
          ]}
        >
          <Input.TextArea
            rows={3}
            maxLength={DESCRIPTION_MAX}
            showCount
            placeholder={EVENTS.REGISTER_MODAL.PLACEHOLDERS.DESCRIPTION}
          />
        </Form.Item>
        <Form.Item
          name="startedAt"
          label={EVENTS.REGISTER_MODAL.LABELS.STARTED_AT}
          rules={[{ required: true, message: EVENTS.REGISTER_MODAL.VALIDATION_MESSAGES.STARTED_REQUIRED }]}
        >
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="endedAt"
          label={EVENTS.REGISTER_MODAL.LABELS.ENDED_AT}
          dependencies={['startedAt']}
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value: Dayjs | null | undefined) {
                if (!value) {
                  return Promise.resolve();
                }
                const started = getFieldValue('startedAt') as Dayjs | undefined;
                if (started && value.isBefore(started)) {
                  return Promise.reject(
                    new Error(EVENTS.REGISTER_MODAL.VALIDATION_MESSAGES.ENDED_BEFORE_STARTED),
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <DatePicker showTime style={{ width: '100%' }} allowClear />
        </Form.Item>
      </Form>
    </Modal>
  );
}
