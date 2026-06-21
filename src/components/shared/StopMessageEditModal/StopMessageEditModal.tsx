'use client';

import { Alert, Button, Descriptions, Form, Input, Modal, Select, Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import type { Schemas } from '@/api/types';
import { LAYOUT, MACHINES, UTILS } from '@/constants/ConstantsAndParams';
import { useResponsive } from '@/hooks/useResponsive';
import type { StopMessageEditModalProps } from '@/models/interfaces/components/ModalProps';
import MachineService from '@/services/MachineService';
import type { Role } from '@/stores/useSessionStore';
import { njPalette } from '@/theme/njTheme';
import { NotificationUtils } from '@/utils/NotificationUtils';
import { getResponsiveModalWidth } from '@/utils/ResponsiveUtils';
import { categoriesForRole } from './categories';

export type { StopMessageEditModalProps } from '@/models/interfaces/components/ModalProps';

const { Paragraph, Text } = Typography;

const MESSAGE_MIN_LENGTH = 8;
const MESSAGE_MAX_LENGTH = 500;

const formatDateTime = (iso: string): string => dayjs(iso).format(UTILS.DATE_FORMATS.DISPLAY);

const formatDuration = (fromIso: string): string => {
  const diffMs = Math.max(0, Date.now() - dayjs(fromIso).valueOf());
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const resolveScopeLabel = (
  userRole: Role,
  sectorLabel?: string,
  shiftLabel?: string,
): string => {
  if (userRole === 'OPERATOR') {
    return MACHINES.STOPS.EDIT_MODAL.SCOPE_OPERATOR;
  }
  if (userRole === 'LEADER') {
    return MACHINES.STOPS.EDIT_MODAL.SCOPE_LEADER(
      sectorLabel ?? '-',
      shiftLabel ?? '-',
    );
  }
  return MACHINES.STOPS.EDIT_MODAL.SCOPE_MANAGER;
};

/**
 * Shared editor for the message that travels with an AUTO_STOPPED record
 *. Renders three variants depending on `userRole`:
 *
 * - OPERATOR : 5 categories, no edition history, concise footer;
 * - LEADER : 6 categories, edition history, sector/shift scope;
 * - MANAGER : 6 categories, edition history, full-view scope.
 *
 * Each successful save triggers an immutable audit_log entry on the
 * backend; the modal warns the user via the yellow callout
 * before the request is sent.
 */
export function StopMessageEditModal(props: StopMessageEditModalProps): React.ReactNode {
  const {
    open,
    onClose,
    machineId,
    machineCode,
    stopId,
    userRole,
    currentMessage,
    currentMessageAuthor,
    detectedAt,
    scopeSectorLabel,
    scopeShiftLabel,
    editHistory,
    editHistoryLoading,
    editHistoryError,
    onSaved,
  } = props;

  const [form] = Form.useForm<{ category: string; message: string }>();
  const [submitting, setSubmitting] = useState(false);
  const [currentLength, setCurrentLength] = useState(0);
  const { isMobile } = useResponsive();

  useEffect(() => {
    if (!open) {
      return;
    }
    form.resetFields();
    setCurrentLength(0);
  }, [open, stopId, form]);

  const categories = useMemo(() => categoriesForRole(userRole), [userRole]);
  const showHistory = userRole !== 'OPERATOR';
  const scopeLabel = useMemo(
    () => resolveScopeLabel(userRole, scopeSectorLabel, scopeShiftLabel),
    [userRole, scopeSectorLabel, scopeShiftLabel],
  );

  const handleFinish = async (values: { category: string; message: string }) => {
    setSubmitting(true);
    try {
      await MachineService.editStopMessage(machineId, stopId, values.message);
      onSaved?.();
      onClose();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
 // eslint-disable-next-line no-console
        console.error('Failed to edit stop message', error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleHistoryErrorNotice = () => {
    if (!editHistoryError) {
      return;
    }
    NotificationUtils({
      key: MACHINES.NOTIFICATIONS.ERROR.KEYS.EDIT_HISTORY_FAILED,
      type: 'error',
      message: MACHINES.NOTIFICATIONS.ERROR.TITLES.EDIT_HISTORY_FAILED,
      description: MACHINES.STOPS.EDIT_MODAL.HISTORY_ERROR,
    });
  };

  useEffect(() => {
    if (open && editHistoryError && showHistory) {
      handleHistoryErrorNotice();
    }
 // We want to react only when the error changes, not on every render.
 // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editHistoryError, open, showHistory]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={MACHINES.STOPS.EDIT_MODAL.TITLE}
      width={getResponsiveModalWidth(isMobile, LAYOUT.RESPONSIVE_WIDTHS.MODAL_LG)}
      destroyOnHidden
      footer={
        <Space>
          <Button onClick={onClose} disabled={submitting}>
            {MACHINES.STOPS.EDIT_MODAL.BUTTONS.CANCEL}
          </Button>
          <Button
            type="primary"
            danger
            loading={submitting}
            onClick={() => form.submit()}
            style={{ background: njPalette.cinnabar, borderColor: njPalette.cinnabar }}
          >
            {MACHINES.STOPS.EDIT_MODAL.BUTTONS.SAVE}
          </Button>
        </Space>
      }
    >
      <Space orientation="vertical" size={16} style={{ width: '100%' }}>
        <Tag color="default" style={{ alignSelf: 'flex-start' }}>
          {scopeLabel}
        </Tag>

        <Descriptions
          title={MACHINES.STOPS.EDIT_MODAL.READ_ONLY_TITLE}
          column={{ xs: 1, md: 2 }}
          size="small"
          bordered
        >
          <Descriptions.Item label={MACHINES.STOPS.EDIT_MODAL.READ_ONLY_MACHINE}>
            <Text code>{machineCode}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={MACHINES.STOPS.EDIT_MODAL.READ_ONLY_DETECTED}>
            {formatDateTime(detectedAt)}
          </Descriptions.Item>
          <Descriptions.Item label={MACHINES.STOPS.EDIT_MODAL.READ_ONLY_DURATION}>
            <Text code>{formatDuration(detectedAt)}</Text>
          </Descriptions.Item>
          <Descriptions.Item
            label={MACHINES.STOPS.EDIT_MODAL.READ_ONLY_CURRENT_MESSAGE}
            span={2}
          >
            <Paragraph style={{ marginBottom: 4 }}>{currentMessage}</Paragraph>
            <Text type="secondary" italic>
              {currentMessageAuthor
                ? MACHINES.STOPS.EDIT_MODAL.READ_ONLY_AUTHOR(
                  currentMessageAuthor.name,
                  formatDateTime(currentMessageAuthor.editedAt),
                )
                : MACHINES.STOPS.EDIT_MODAL.READ_ONLY_NEVER_EDITED}
            </Text>
          </Descriptions.Item>
        </Descriptions>

        <Form<{ category: string; message: string }>
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          requiredMark
        >
          <Form.Item
            name="category"
            label={MACHINES.STOPS.EDIT_MODAL.CATEGORY_LABEL}
            rules={[
              {
                required: true,
                message: MACHINES.STOPS.EDIT_MODAL.VALIDATION_MESSAGES.CATEGORY_REQUIRED,
              },
            ]}
          >
            <Select
              placeholder={MACHINES.STOPS.EDIT_MODAL.CATEGORY_PLACEHOLDER}
              options={categories.map((category) => ({
                value: category.value,
                label: category.label,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="message"
            label={MACHINES.STOPS.EDIT_MODAL.MESSAGE_LABEL}
            rules={[
              {
                required: true,
                message: MACHINES.STOPS.EDIT_MODAL.VALIDATION_MESSAGES.MESSAGE_REQUIRED,
              },
              {
                min: MESSAGE_MIN_LENGTH,
                message:
                  MACHINES.STOPS.EDIT_MODAL.VALIDATION_MESSAGES.MESSAGE_MIN_LENGTH(
                    MESSAGE_MIN_LENGTH,
                  ),
              },
              {
                max: MESSAGE_MAX_LENGTH,
                message:
                  MACHINES.STOPS.EDIT_MODAL.VALIDATION_MESSAGES.MESSAGE_MAX_LENGTH(
                    MESSAGE_MAX_LENGTH,
                  ),
              },
            ]}
            extra={MACHINES.STOPS.EDIT_MODAL.MESSAGE_COUNTER(currentLength, MESSAGE_MAX_LENGTH)}
          >
            <Input.TextArea
              autoSize={{ minRows: 3, maxRows: 6 }}
              maxLength={MESSAGE_MAX_LENGTH}
              placeholder={MACHINES.STOPS.EDIT_MODAL.MESSAGE_PLACEHOLDER}
              onChange={(event) => setCurrentLength(event.target.value.length)}
            />
          </Form.Item>
        </Form>

        <Alert
          type="warning"
          showIcon
          message={MACHINES.STOPS.EDIT_MODAL.AUDIT_CALLOUT_TITLE}
          description={MACHINES.STOPS.EDIT_MODAL.AUDIT_CALLOUT_DESCRIPTION}
        />

        {showHistory ? (
          <section aria-labelledby="stop-edit-history-title">
            <Text strong id="stop-edit-history-title">
              {MACHINES.STOPS.EDIT_MODAL.HISTORY_TITLE}
            </Text>
            {editHistoryLoading ? (
              <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
                ...
              </Paragraph>
            ) : editHistoryError ? (
              <Paragraph type="danger" style={{ marginTop: 8, marginBottom: 0 }}>
                {MACHINES.STOPS.EDIT_MODAL.HISTORY_ERROR}
              </Paragraph>
            ) : !editHistory || editHistory.length === 0 ? (
              <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
                {MACHINES.STOPS.EDIT_MODAL.HISTORY_EMPTY}
              </Paragraph>
            ) : (
              <Space
                orientation="vertical"
                size={8}
                style={{ width: '100%', marginTop: 8 }}
              >
                {editHistory.map((entry, index) => (
                  <article
                    key={`${entry.editedAt}-${index}`}
                    style={{
                      borderLeft: `3px solid ${njPalette.cobalt}`,
                      paddingLeft: 12,
                    }}
                  >
                    <Text strong>
                      {MACHINES.STOPS.EDIT_MODAL.HISTORY_ITEM(
                        entry.authorName ?? '-',
                        formatDateTime(entry.editedAt),
                      )}
                    </Text>
                    <Paragraph style={{ marginBottom: 0 }}>{entry.newMessage}</Paragraph>
                    {entry.previousMessage ? (
                      <Text type="secondary" italic>
                        {entry.previousMessage}
                      </Text>
                    ) : null}
                  </article>
                ))}
              </Space>
            )}
          </section>
        ) : null}
      </Space>
    </Modal>
  );
}
