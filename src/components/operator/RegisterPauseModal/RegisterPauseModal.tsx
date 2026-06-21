'use client';

import { AxiosError } from 'axios';
import { Button, Descriptions, Form, Input, Modal, Select, Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { MACHINES, UTILS } from '@/constants/ConstantsAndParams';
import type { RegisterPauseModalProps } from '@/models/interfaces/components/ModalProps';
import type { RegisterPauseFormValues as FormValues } from '@/models/types/RegisterPauseFormValues';
import MachineService from '@/services/MachineService';
import { NotificationUtils } from '@/utils/NotificationUtils';

export type { RegisterPauseModalProps } from '@/models/interfaces/components/ModalProps';

const { Text } = Typography;

const REASON_MAX_LENGTH = 120;
const OBSERVATION_MAX_LENGTH = 240;
const OTHER_VALUE = 'OUTRO';

const formatDateTime = (iso: string): string => dayjs(iso).format(UTILS.DATE_FORMATS.DISPLAY);

const buildSubmittedReason = (values: FormValues): string => {
  if (values.reason === OTHER_VALUE) {
    const detail = values.otherDescription?.trim() ?? '';
    return values.observation
      ? `OUTRO: ${detail} - ${values.observation.trim()}`
      : `OUTRO: ${detail}`;
  }
  return values.observation
    ? `${values.reason} - ${values.observation.trim()}`
    : values.reason;
};

/**
 * Classifies the last open isolated pause of a machine. The 4-option
 * selector targets the Operator flow; "OUTRO" reveals a free text field.
 * If the backend answers 409 the modal exposes the warning copy through
 * {@link NotificationUtils} — the pause stays open and the operator can
 * cancel safely.
 */
export function RegisterPauseModal(props: RegisterPauseModalProps): React.ReactNode {
  const { open, onClose, machineId, machineCode, productionOrderCode, pauseStartedAt, onRegistered } =
    props;
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [reasonValue, setReasonValue] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!open) {
      return;
    }
    form.resetFields();
    setReasonValue(undefined);
  }, [open, machineId, form]);

  const handleFinish = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const reasonText = buildSubmittedReason(values);
      await MachineService.registerPause(machineId, reasonText, true);
      onRegistered?.();
      onClose();
    } catch (error) {
      const status = error instanceof AxiosError ? error.response?.status : undefined;
      if (status === 409) {
        NotificationUtils({
          key: MACHINES.NOTIFICATIONS.WARNING.KEYS.PAUSE_ALREADY_CLASSIFIED,
          type: 'warning',
          message: MACHINES.NOTIFICATIONS.WARNING.TITLES.PAUSE_ALREADY_CLASSIFIED,
          description: MACHINES.NOTIFICATIONS.WARNING.MESSAGES.PAUSE_ALREADY_CLASSIFIED,
        });
        return;
      }
      NotificationUtils({
        key: MACHINES.NOTIFICATIONS.ERROR.KEYS.PAUSE_CLASSIFY_FAILED,
        type: 'error',
        message: MACHINES.NOTIFICATIONS.ERROR.TITLES.PAUSE_CLASSIFY_FAILED,
        description: MACHINES.NOTIFICATIONS.ERROR.MESSAGES.PAUSE_CLASSIFY_FAILED,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={MACHINES.PAUSES.REGISTER_MODAL.TITLE}
      width={520}
      destroyOnHidden
      footer={
        <Space>
          <Button onClick={onClose} disabled={submitting}>
            {MACHINES.PAUSES.REGISTER_MODAL.BUTTONS.CANCEL}
          </Button>
          <Button type="primary" loading={submitting} onClick={() => form.submit()}>
            {MACHINES.PAUSES.REGISTER_MODAL.BUTTONS.SAVE}
          </Button>
        </Space>
      }
    >
      <Space orientation="vertical" size={16} style={{ width: '100%' }}>
        <Tag color="default" style={{ alignSelf: 'flex-start' }}>
          {MACHINES.PAUSES.REGISTER_MODAL.SCOPE_LABEL}
        </Tag>

        <Descriptions
          title={MACHINES.PAUSES.REGISTER_MODAL.READ_ONLY_TITLE}
          column={1}
          size="small"
          bordered
        >
          <Descriptions.Item label={MACHINES.PAUSES.REGISTER_MODAL.READ_ONLY_MACHINE}>
            <Text code>{machineCode}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={MACHINES.PAUSES.REGISTER_MODAL.READ_ONLY_ORDER}>
            {productionOrderCode ? (
              <Text code>{productionOrderCode}</Text>
            ) : (
              <Text type="secondary">
                {MACHINES.PAUSES.REGISTER_MODAL.READ_ONLY_ORDER_FALLBACK}
              </Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label={MACHINES.PAUSES.REGISTER_MODAL.READ_ONLY_STARTED_AT}>
            <Text code>{formatDateTime(pauseStartedAt)}</Text>
          </Descriptions.Item>
        </Descriptions>

        <Form<FormValues>
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ reason: undefined }}
        >
          <Form.Item
            name="reason"
            label={MACHINES.PAUSES.REGISTER_MODAL.LABELS.REASON}
            rules={[
              {
                required: true,
                message: MACHINES.PAUSES.REGISTER_MODAL.VALIDATION_MESSAGES.REASON_REQUIRED,
              },
              {
                max: REASON_MAX_LENGTH,
                message:
                  MACHINES.PAUSES.REGISTER_MODAL.VALIDATION_MESSAGES.REASON_MAX_LENGTH(
                    REASON_MAX_LENGTH,
                  ),
              },
            ]}
          >
            <Select
              placeholder={MACHINES.PAUSES.REGISTER_MODAL.PLACEHOLDERS.REASON}
              onChange={(value) => setReasonValue(value as string)}
              options={MACHINES.PAUSES.CATEGORIES.map((category) => ({
                value: category.value,
                label: category.label,
              }))}
            />
          </Form.Item>

          {reasonValue === OTHER_VALUE ? (
            <Form.Item
              name="otherDescription"
              label={MACHINES.PAUSES.REGISTER_MODAL.LABELS.OBSERVATION}
              rules={[
                {
                  required: true,
                  message: MACHINES.PAUSES.REGISTER_MODAL.VALIDATION_MESSAGES.OTHER_REQUIRED,
                },
                {
                  max: REASON_MAX_LENGTH,
                  message:
                    MACHINES.PAUSES.REGISTER_MODAL.VALIDATION_MESSAGES.REASON_MAX_LENGTH(
                      REASON_MAX_LENGTH,
                    ),
                },
              ]}
            >
              <Input maxLength={REASON_MAX_LENGTH} placeholder={MACHINES.PAUSES.REGISTER_MODAL.PLACEHOLDERS.OBSERVATION} />
            </Form.Item>
          ) : null}

          <Form.Item
            name="observation"
            label={MACHINES.PAUSES.REGISTER_MODAL.LABELS.OBSERVATION}
            rules={[
              {
                max: OBSERVATION_MAX_LENGTH,
                message:
                  MACHINES.PAUSES.REGISTER_MODAL.VALIDATION_MESSAGES.OBSERVATION_MAX_LENGTH(
                    OBSERVATION_MAX_LENGTH,
                  ),
              },
            ]}
          >
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 4 }}
              maxLength={OBSERVATION_MAX_LENGTH}
              placeholder={MACHINES.PAUSES.REGISTER_MODAL.PLACEHOLDERS.OBSERVATION}
            />
          </Form.Item>
        </Form>
      </Space>
    </Modal>
  );
}
