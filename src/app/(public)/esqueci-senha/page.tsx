'use client';

import { Button, Form, Input, Typography } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AUTH } from '@/constants/ConstantsAndParams';
import type { RequestFormValues } from '@/models/types/AuthFormValues';
import AuthService from '@/services/AuthService';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values: RequestFormValues) => {
    setSubmitting(true);
    try {
      await AuthService.requestPasswordReset({ login: values.login });
      router.replace('/login');
    } catch {
      // Notifications are handled by the axios interceptor.
    } finally {
      setSubmitting(false);
    }
  };

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
          {AUTH.PASSWORD_RESET.REQUEST.TITLE}
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
          {AUTH.PASSWORD_RESET.REQUEST.DESCRIPTION}
        </Typography.Paragraph>
        <Form<RequestFormValues> layout="vertical" onFinish={onSubmit} disabled={submitting}>
          <Form.Item
            label={AUTH.PASSWORD_RESET.REQUEST.LABELS.LOGIN}
            name="login"
            rules={[
              {
                required: true,
                message: AUTH.PASSWORD_RESET.REQUEST.VALIDATION_MESSAGES.LOGIN_REQUIRED,
              },
            ]}
          >
            <Input
              placeholder={AUTH.PASSWORD_RESET.REQUEST.PLACEHOLDERS.LOGIN}
              autoFocus
              autoComplete="username"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={submitting}>
              {AUTH.PASSWORD_RESET.REQUEST.BUTTONS.SUBMIT}
            </Button>
          </Form.Item>
        </Form>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Link href="/login">{AUTH.PASSWORD_RESET.REQUEST.BUTTONS.BACK}</Link>
        </div>
      </div>
    </section>
  );
}
