'use client';

import { Button, Form, Input, Typography } from 'antd';
import { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { AUTH } from '@/constants/ConstantsAndParams';
import type { ConfirmFormValues } from '@/models/types/AuthFormValues';
import AuthService from '@/services/AuthService';
import { NotificationUtils } from '@/utils/NotificationUtils';

const PASSWORD_MIN_LENGTH = 12;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values: ConfirmFormValues) => {
    if (!token) {
      NotificationUtils({
        key: AUTH.NOTIFICATIONS.ERROR.KEYS.RESET_TOKEN_INVALID,
        type: 'error',
        message: AUTH.NOTIFICATIONS.ERROR.TITLES.RESET_TOKEN_INVALID,
        description: AUTH.PASSWORD_RESET.CONFIRM.VALIDATION_MESSAGES.MISSING_TOKEN,
      });
      return;
    }
    setSubmitting(true);
    try {
      await AuthService.confirmPasswordReset({
        token,
        newPassword: values.newPassword,
      });
      router.replace('/login');
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 400) {
        NotificationUtils({
          key: AUTH.NOTIFICATIONS.ERROR.KEYS.RESET_TOKEN_INVALID,
          type: 'error',
          message: AUTH.NOTIFICATIONS.ERROR.TITLES.RESET_TOKEN_INVALID,
          description: AUTH.NOTIFICATIONS.ERROR.MESSAGES.RESET_TOKEN_INVALID,
        });
        return;
      }
      NotificationUtils({ defaultType: 'GENERIC_ERROR' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form<ConfirmFormValues> layout="vertical" onFinish={onSubmit} disabled={submitting}>
      <Form.Item
        label={AUTH.PASSWORD_RESET.CONFIRM.LABELS.NEW_PASSWORD}
        name="newPassword"
        rules={[
          {
            required: true,
            message: AUTH.PASSWORD_RESET.CONFIRM.VALIDATION_MESSAGES.NEW_PASSWORD_REQUIRED,
          },
          {
            min: PASSWORD_MIN_LENGTH,
            message:
              AUTH.PASSWORD_RESET.CONFIRM.VALIDATION_MESSAGES.MIN_LENGTH(PASSWORD_MIN_LENGTH),
          },
        ]}
      >
        <Input.Password
          placeholder={AUTH.PASSWORD_RESET.CONFIRM.PLACEHOLDERS.NEW_PASSWORD}
          autoComplete="new-password"
        />
      </Form.Item>
      <Form.Item
        label={AUTH.PASSWORD_RESET.CONFIRM.LABELS.CONFIRM_PASSWORD}
        name="confirmPassword"
        dependencies={['newPassword']}
        rules={[
          {
            required: true,
            message: AUTH.PASSWORD_RESET.CONFIRM.VALIDATION_MESSAGES.CONFIRM_REQUIRED,
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error(AUTH.PASSWORD_RESET.CONFIRM.VALIDATION_MESSAGES.MISMATCH),
              );
            },
          }),
        ]}
      >
        <Input.Password
          placeholder={AUTH.PASSWORD_RESET.CONFIRM.PLACEHOLDERS.CONFIRM_PASSWORD}
          autoComplete="new-password"
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={submitting}>
          {AUTH.PASSWORD_RESET.CONFIRM.BUTTONS.SUBMIT}
        </Button>
      </Form.Item>
    </Form>
  );
}

export default function ResetPasswordPage() {
  return (
    <section
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 380 }}>
        <Typography.Title level={3} style={{ marginBottom: 8 }}>
          {AUTH.PASSWORD_RESET.CONFIRM.TITLE}
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
          {AUTH.PASSWORD_RESET.CONFIRM.DESCRIPTION}
        </Typography.Paragraph>
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Link href="/login">{AUTH.PASSWORD_RESET.CONFIRM.BUTTONS.BACK}</Link>
        </div>
      </div>
    </section>
  );
}
