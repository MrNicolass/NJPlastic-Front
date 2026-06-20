'use client';

import { Button, Drawer, Form, Input, Select, Space, Switch } from 'antd';
import { useEffect } from 'react';
import type { Schemas } from '@/api/types';
import { USERS } from '@/constants/ConstantsAndParams';
import type { UserFormDrawerProps } from '@/models/interfaces/components/DrawerProps';
import type { UserFormValues as FormValues } from '@/models/types/UserFormValues';
import UserService from '@/services/UserService';

export type { UserFormDrawerProps } from '@/models/interfaces/components/DrawerProps';

const PASSWORD_MIN_LENGTH = 12;

const ROLE_OPTIONS: { value: Schemas['UserResponseDTO']['role']; label: string }[] = [
  { value: 'OPERATOR', label: USERS.ROLE_LABELS.OPERATOR },
  { value: 'LEADER', label: USERS.ROLE_LABELS.LEADER },
  { value: 'MANAGER', label: USERS.ROLE_LABELS.MANAGER },
];

/**
 * Side drawer used for both creating and editing users (* sub-task 3). The mode prop drives which fields are editable - login
 * and password are immutable in edit mode. On submit the drawer calls
 * UserService directly and reports back via onSaved so the parent
 * page can refetch.
 */
export function UserFormDrawer({
  open,
  mode,
  user,
  onClose,
  onSaved,
}: UserFormDrawerProps) {
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    if (!open) {
      return;
    }
    if (mode === 'edit' && user) {
      form.setFieldsValue({
        login: user.login,
        name: user.name,
        email: user.email,
        role: user.role,
        sector: user.sector,
        shift: user.shift,
        active: user.active,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ active: true });
    }
  }, [open, mode, user, form]);

  const handleFinish = async (values: FormValues) => {
    if (mode === 'create') {
      const payload: Schemas['UserRequestDTO'] = {
        login: values.login ?? '',
        name: values.name,
        email: values.email,
        password: values.password ?? '',
        role: values.role,
        sector: values.sector,
        shift: values.shift,
      };
      await UserService.create(payload);
    } else if (user) {
      const payload: Schemas['UserUpdateRequestDTO'] = {
        name: values.name,
        email: values.email,
        role: values.role,
        sector: values.sector,
        shift: values.shift,
        active: values.active ?? true,
      };
      await UserService.update(user.id, payload);
    }
    onSaved();
    onClose();
  };

  const title =
    mode === 'create' ? USERS.FORM_DRAWER.TITLE_CREATE : USERS.FORM_DRAWER.TITLE_EDIT;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      size={520}
      destroyOnHidden
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={onClose}>{USERS.FORM_DRAWER.BUTTONS.CANCEL}</Button>
          <Button type="primary" onClick={() => form.submit()}>
            {USERS.FORM_DRAWER.BUTTONS.SAVE}
          </Button>
        </Space>
      }
    >
      <Form<FormValues> layout="vertical" form={form} onFinish={handleFinish}>
        {mode === 'create' ? (
          <Form.Item
            name="login"
            label={USERS.FORM_DRAWER.LABELS.LOGIN}
            rules={[{ required: true, message: USERS.FORM_DRAWER.VALIDATION_MESSAGES.LOGIN_REQUIRED }]}
          >
            <Input placeholder={USERS.FORM_DRAWER.PLACEHOLDERS.LOGIN} />
          </Form.Item>
        ) : (
          <Form.Item label={USERS.FORM_DRAWER.LABELS.LOGIN}>
            <Input value={user?.login ?? ''} disabled />
          </Form.Item>
        )}

        <Form.Item
          name="name"
          label={USERS.FORM_DRAWER.LABELS.NAME}
          rules={[{ required: true, message: USERS.FORM_DRAWER.VALIDATION_MESSAGES.NAME_REQUIRED }]}
        >
          <Input placeholder={USERS.FORM_DRAWER.PLACEHOLDERS.NAME} />
        </Form.Item>

        <Form.Item
          name="email"
          label={USERS.FORM_DRAWER.LABELS.EMAIL}
          rules={[
            { required: true, message: USERS.FORM_DRAWER.VALIDATION_MESSAGES.EMAIL_REQUIRED },
            { type: 'email', message: USERS.FORM_DRAWER.VALIDATION_MESSAGES.EMAIL_INVALID },
          ]}
        >
          <Input placeholder={USERS.FORM_DRAWER.PLACEHOLDERS.EMAIL} />
        </Form.Item>

        {mode === 'create' ? (
          <Form.Item
            name="password"
            label={USERS.FORM_DRAWER.LABELS.PASSWORD}
            rules={[
              {
                required: true,
                message: USERS.FORM_DRAWER.VALIDATION_MESSAGES.PASSWORD_REQUIRED,
              },
              {
                min: PASSWORD_MIN_LENGTH,
                message: USERS.FORM_DRAWER.VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH(
                  PASSWORD_MIN_LENGTH,
                ),
              },
            ]}
          >
            <Input.Password placeholder={USERS.FORM_DRAWER.PLACEHOLDERS.PASSWORD} />
          </Form.Item>
        ) : null}

        <Form.Item
          name="role"
          label={USERS.FORM_DRAWER.LABELS.ROLE}
          rules={[{ required: true, message: USERS.FORM_DRAWER.VALIDATION_MESSAGES.ROLE_REQUIRED }]}
        >
          <Select
            placeholder={USERS.FORM_DRAWER.PLACEHOLDERS.ROLE}
            options={ROLE_OPTIONS}
          />
        </Form.Item>

        <Form.Item name="sector" label={USERS.FORM_DRAWER.LABELS.SECTOR}>
          <Input placeholder={USERS.FORM_DRAWER.PLACEHOLDERS.SECTOR} />
        </Form.Item>

        <Form.Item name="shift" label={USERS.FORM_DRAWER.LABELS.SHIFT}>
          <Input placeholder={USERS.FORM_DRAWER.PLACEHOLDERS.SHIFT} />
        </Form.Item>

        {mode === 'edit' ? (
          <Form.Item
            name="active"
            label={USERS.FORM_DRAWER.LABELS.ACTIVE}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        ) : null}
      </Form>
    </Drawer>
  );
}
