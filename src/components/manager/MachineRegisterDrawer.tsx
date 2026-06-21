'use client';

import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Switch,
  Tabs,
} from 'antd';
import { useEffect, useMemo } from 'react';
import type { Schemas } from '@/api/types';
import { LAYOUT, MACHINE_REGISTER } from '@/constants/ConstantsAndParams';
import { useResponsive } from '@/hooks/useResponsive';
import type { MachineRegisterDrawerProps } from '@/models/interfaces/components/DrawerProps';
import type { MachineFormValues as FormValues } from '@/models/types/MachineFormValues';
import MachineService from '@/services/MachineService';
import { getResponsiveDrawerWidth } from '@/utils/ResponsiveUtils';

export type { MachineRegisterDrawerProps } from '@/models/interfaces/components/DrawerProps';

const DEFAULT_VALUES: Partial<FormValues> = {
  standardCycleMs: 2000,
  toleranceFactor: 1.5,
  consecutivePausesToStop: 3,
  offlineWindowMs: 60_000,
  active: true,
  shifts: ['A', 'B', 'C'],
};

const buildTopic = (code?: string): string => {
  if (!code || code.trim().length === 0) {
    return 'njplastic/pulso';
  }
  return `njplastic/pulso (machineCode=${code.trim()})`;
};

/**
 * Multi-tab drawer that registers or edits a machine. The five sections
 * (Identification, MQTT capture, Cycle parameters, Stop escalation,
 * Sector + shifts) are rendered as tabs. The footer holds a live preview
 * card so the user reviews the configuration before confirming. The MQTT
 * topic is read-only and derived from the short code - the backend
 * listens on a single shared topic and identifies the source via the
 * machineCode field of the PulsePayload.
 */
export function MachineRegisterDrawer({
  open,
  mode,
  machine,
  onClose,
  onSaved,
}: MachineRegisterDrawerProps) {
  const [form] = Form.useForm<FormValues>();
  const { isMobile } = useResponsive();

  useEffect(() => {
    if (!open) {
      return;
    }
    if (mode === 'edit' && machine) {
      form.setFieldsValue({
        code: machine.code,
        description: machine.description ?? '',
        sector: machine.sector,
        standardCycleMs: machine.standardCycleMs,
        toleranceFactor: machine.toleranceFactor,
        consecutivePausesToStop: machine.consecutivePausesToStop,
        offlineWindowMs: machine.offlineWindowMs,
        active: machine.active,
        shifts: DEFAULT_VALUES.shifts,
      });
    } else {
      form.resetFields();
      form.setFieldsValue(DEFAULT_VALUES);
    }
  }, [open, mode, machine, form]);

  const codeWatch = Form.useWatch('code', form);
  const descriptionWatch = Form.useWatch('description', form);
  const sectorWatch = Form.useWatch('sector', form);
  const cycleWatch = Form.useWatch('standardCycleMs', form);
  const toleranceWatch = Form.useWatch('toleranceFactor', form);
  const consecutiveWatch = Form.useWatch('consecutivePausesToStop', form);
  const offlineWatch = Form.useWatch('offlineWindowMs', form);
  const shiftsWatch = Form.useWatch('shifts', form);

  const previewTopic = useMemo(
    () => buildTopic(mode === 'edit' && machine ? machine.code : codeWatch),
    [mode, machine, codeWatch],
  );

  const handleFinish = async (values: FormValues) => {
    if (mode === 'create') {
      const payload: Schemas['MachineRequestDTO'] = {
        code: values.code ?? '',
        description: values.description,
        sector: values.sector,
        standardCycleMs: values.standardCycleMs,
        toleranceFactor: values.toleranceFactor,
        consecutivePausesToStop: values.consecutivePausesToStop,
        offlineWindowMs: values.offlineWindowMs,
      };
      await MachineService.createMachine(payload);
    } else if (machine) {
      const payload: Schemas['MachineUpdateRequestDTO'] = {
        description: values.description,
        sector: values.sector,
        standardCycleMs: values.standardCycleMs,
        toleranceFactor: values.toleranceFactor,
        consecutivePausesToStop: values.consecutivePausesToStop,
        offlineWindowMs: values.offlineWindowMs,
        active: values.active ?? true,
      };
      await MachineService.updateMachine(machine.id, payload);
    }
    onSaved();
    onClose();
  };

  const title =
    mode === 'create' ? MACHINE_REGISTER.DRAWER.TITLE_CREATE : MACHINE_REGISTER.DRAWER.TITLE_EDIT;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      width={getResponsiveDrawerWidth(isMobile, LAYOUT.RESPONSIVE_WIDTHS.DRAWER_LG)}
      destroyOnHidden
      footer={
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={14}>
            <Card size="small" title={MACHINE_REGISTER.DRAWER.LABELS.PREVIEW_TITLE}>
              {codeWatch || (mode === 'edit' && machine) ? (
                <Descriptions size="small" column={1}>
                  <Descriptions.Item label={MACHINE_REGISTER.DRAWER.LABELS.CODE}>
                    {mode === 'edit' && machine ? machine.code : codeWatch}
                  </Descriptions.Item>
                  <Descriptions.Item label={MACHINE_REGISTER.DRAWER.LABELS.DESCRIPTION}>
                    {descriptionWatch ?? '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label={MACHINE_REGISTER.DRAWER.LABELS.SECTOR}>
                    {sectorWatch ?? '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label={MACHINE_REGISTER.DRAWER.LABELS.STANDARD_CYCLE_MS}>
                    {cycleWatch ?? '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label={MACHINE_REGISTER.DRAWER.LABELS.TOLERANCE_FACTOR}>
                    {toleranceWatch ?? '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label={MACHINE_REGISTER.DRAWER.LABELS.CONSECUTIVE_PAUSES_TO_STOP}>
                    {consecutiveWatch ?? '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label={MACHINE_REGISTER.DRAWER.LABELS.OFFLINE_WINDOW_MS}>
                    {offlineWatch ?? '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label={MACHINE_REGISTER.DRAWER.LABELS.SHIFTS}>
                    {(shiftsWatch ?? []).join(', ') || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label={MACHINE_REGISTER.DRAWER.LABELS.MQTT_TOPIC}>
                    {previewTopic}
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                MACHINE_REGISTER.DRAWER.LABELS.PREVIEW_FALLBACK
              )}
            </Card>
          </Col>
          <Col xs={24} md={10}>
            <Space style={{ float: 'right' }}>
              <Button onClick={onClose}>{MACHINE_REGISTER.DRAWER.BUTTONS.CANCEL}</Button>
              <Button type="primary" onClick={() => form.submit()}>
                {MACHINE_REGISTER.DRAWER.BUTTONS.SAVE}
              </Button>
            </Space>
          </Col>
        </Row>
      }
    >
      <Form<FormValues> layout="vertical" form={form} onFinish={handleFinish}>
        <Tabs
          defaultActiveKey="identification"
          items={[
            {
              key: 'identification',
              label: MACHINE_REGISTER.DRAWER.TABS.IDENTIFICATION,
              forceRender: true,
              children: (
                <>
                  {mode === 'edit' ? (
                    <Alert
                      type="info"
                      showIcon
                      message={MACHINE_REGISTER.DRAWER.HINTS.CODE_IMMUTABLE}
                      style={{ marginBottom: 16 }}
                    />
                  ) : null}
                  {mode === 'create' ? (
                    <Form.Item
                      name="code"
                      label={MACHINE_REGISTER.DRAWER.LABELS.CODE}
                      rules={[
                        {
                          required: true,
                          message: MACHINE_REGISTER.DRAWER.VALIDATION_MESSAGES.CODE_REQUIRED,
                        },
                      ]}
                    >
                      <Input placeholder={MACHINE_REGISTER.DRAWER.PLACEHOLDERS.CODE} />
                    </Form.Item>
                  ) : (
                    <Form.Item label={MACHINE_REGISTER.DRAWER.LABELS.CODE}>
                      <Input value={machine?.code ?? ''} disabled />
                    </Form.Item>
                  )}
                  <Form.Item
                    name="description"
                    label={MACHINE_REGISTER.DRAWER.LABELS.DESCRIPTION}
                    rules={[
                      {
                        required: true,
                        message: MACHINE_REGISTER.DRAWER.VALIDATION_MESSAGES.DESCRIPTION_REQUIRED,
                      },
                    ]}
                  >
                    <Input placeholder={MACHINE_REGISTER.DRAWER.PLACEHOLDERS.DESCRIPTION} />
                  </Form.Item>
                  <Form.Item name="sector" label={MACHINE_REGISTER.DRAWER.LABELS.SECTOR}>
                    <Input placeholder={MACHINE_REGISTER.DRAWER.PLACEHOLDERS.SECTOR} />
                  </Form.Item>
                  {mode === 'edit' ? (
                    <Form.Item
                      name="active"
                      label={MACHINE_REGISTER.DRAWER.LABELS.ACTIVE}
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  ) : null}
                </>
              ),
            },
            {
              key: 'capture',
              label: MACHINE_REGISTER.DRAWER.TABS.CAPTURE,
              forceRender: true,
              children: (
                <>
                  <Alert
                    type="info"
                    showIcon
                    message={MACHINE_REGISTER.DRAWER.HINTS.TOPIC_AUTO}
                    style={{ marginBottom: 16 }}
                  />
                  <Form.Item label={MACHINE_REGISTER.DRAWER.LABELS.MQTT_TOPIC}>
                    <Input value={previewTopic} disabled />
                  </Form.Item>
                </>
              ),
            },
            {
              key: 'cycle',
              label: MACHINE_REGISTER.DRAWER.TABS.CYCLE,
              forceRender: true,
              children: (
                <>
                  <Form.Item
                    name="standardCycleMs"
                    label={MACHINE_REGISTER.DRAWER.LABELS.STANDARD_CYCLE_MS}
                    rules={[
                      {
                        required: true,
                        message: MACHINE_REGISTER.DRAWER.VALIDATION_MESSAGES.STANDARD_CYCLE_REQUIRED,
                      },
                      {
                        type: 'number',
                        min: 1,
                        message: MACHINE_REGISTER.DRAWER.VALIDATION_MESSAGES.STANDARD_CYCLE_MIN,
                      },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      style={{ width: '100%' }}
                      placeholder={MACHINE_REGISTER.DRAWER.PLACEHOLDERS.STANDARD_CYCLE_MS}
                    />
                  </Form.Item>
                  <Form.Item
                    name="toleranceFactor"
                    label={MACHINE_REGISTER.DRAWER.LABELS.TOLERANCE_FACTOR}
                    rules={[
                      {
                        required: true,
                        message: MACHINE_REGISTER.DRAWER.VALIDATION_MESSAGES.TOLERANCE_REQUIRED,
                      },
                      {
                        validator: async (_rule, value) => {
                          if (typeof value !== 'number' || value <= 1.0) {
                            throw new Error(
                              MACHINE_REGISTER.DRAWER.VALIDATION_MESSAGES.TOLERANCE_MIN,
                            );
                          }
                        },
                      },
                    ]}
                  >
                    <InputNumber
                      min={1.01}
                      step={0.1}
                      style={{ width: '100%' }}
                      placeholder={MACHINE_REGISTER.DRAWER.PLACEHOLDERS.TOLERANCE_FACTOR}
                    />
                  </Form.Item>
                </>
              ),
            },
            {
              key: 'escalation',
              label: MACHINE_REGISTER.DRAWER.TABS.ESCALATION,
              forceRender: true,
              children: (
                <>
                  <Form.Item
                    name="consecutivePausesToStop"
                    label={MACHINE_REGISTER.DRAWER.LABELS.CONSECUTIVE_PAUSES_TO_STOP}
                    rules={[
                      {
                        required: true,
                        message:
                          MACHINE_REGISTER.DRAWER.VALIDATION_MESSAGES.CONSECUTIVE_REQUIRED,
                      },
                      {
                        type: 'number',
                        min: 1,
                        message: MACHINE_REGISTER.DRAWER.VALIDATION_MESSAGES.CONSECUTIVE_MIN,
                      },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      style={{ width: '100%' }}
                      placeholder={MACHINE_REGISTER.DRAWER.PLACEHOLDERS.CONSECUTIVE_PAUSES_TO_STOP}
                    />
                  </Form.Item>
                  <Form.Item
                    name="offlineWindowMs"
                    label={MACHINE_REGISTER.DRAWER.LABELS.OFFLINE_WINDOW_MS}
                    rules={[
                      {
                        required: true,
                        message: MACHINE_REGISTER.DRAWER.VALIDATION_MESSAGES.OFFLINE_REQUIRED,
                      },
                      {
                        type: 'number',
                        min: 1,
                        message: MACHINE_REGISTER.DRAWER.VALIDATION_MESSAGES.OFFLINE_MIN,
                      },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      style={{ width: '100%' }}
                      placeholder={MACHINE_REGISTER.DRAWER.PLACEHOLDERS.OFFLINE_WINDOW_MS}
                    />
                  </Form.Item>
                </>
              ),
            },
            {
              key: 'sector-shift',
              label: MACHINE_REGISTER.DRAWER.TABS.SECTOR_SHIFT,
              forceRender: true,
              children: (
                <>
                  <Form.Item name="sector" label={MACHINE_REGISTER.DRAWER.LABELS.SECTOR}>
                    <Input placeholder={MACHINE_REGISTER.DRAWER.PLACEHOLDERS.SECTOR} />
                  </Form.Item>
                  <Form.Item name="shifts" label={MACHINE_REGISTER.DRAWER.LABELS.SHIFTS}>
                    <Checkbox.Group options={[...MACHINE_REGISTER.DRAWER.SHIFT_OPTIONS]} />
                  </Form.Item>
                </>
              ),
            },
          ]}
        />
      </Form>
    </Drawer>
  );
}
