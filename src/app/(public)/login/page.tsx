'use client';

import { Button, Checkbox, Form, Input, Tooltip, Typography } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import njLogo from '@/assets/logo/NJPlastic-logo-a-256px.png';
import { AUTH } from '@/constants/ConstantsAndParams';
import { DEFAULT_AUTHENTICATED_ROUTE } from '@/constants/Routes';
import type { LoginFormValues } from '@/models/types/AuthFormValues';
import AuthService from '@/services/AuthService';
import { useSessionStore } from '@/stores/useSessionStore';
import { njPalette } from '@/theme/njTheme';

const PASSWORD_MIN_LENGTH = 12;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useSessionStore((state) => state.setSession);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    try {
      const response = await AuthService.login({
        login: values.login,
        password: values.password,
      });
      setSession({
        user: {
          id: response.user.id,
          name: response.user.name,
          login: response.user.login,
        },
        role: response.user.role,
        expiresAt: Date.now() + response.expiresInSeconds * 1000,
      });
      const redirectTarget = searchParams.get('redirect') ?? DEFAULT_AUTHENTICATED_ROUTE;
      router.replace(redirectTarget);
    } catch {
 // Notifications are handled by the axios interceptor.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <aside
        aria-hidden
        className="login-decorative-column"
        style={{
          flex: 1,
          background: njPalette.tealDeep,
          color: '#ffffff',
          padding: '64px',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Image
            src={njLogo}
            alt="NJPlastic"
            width={64}
            height={64}
            priority
            style={{ borderRadius: 12 }}
          />
          <Typography.Title level={2} style={{ color: '#ffffff', margin: 0 }}>
            NJPlastic
          </Typography.Title>
        </div>
        <div>
          <Typography.Title level={3} style={{ color: '#ffffff' }}>
            Monitoramento em tempo real
          </Typography.Title>
          <Typography.Paragraph style={{ color: '#ffffff' }}>
            Acompanhe as injetoras, classifique pausas e gere relatorios de turno.
          </Typography.Paragraph>
        </div>
        <Typography.Text style={{ color: '#ffffff', opacity: 0.7 }}>
          v1.0 - MVP
        </Typography.Text>
      </aside>
      <section
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 360 }}>
          <Typography.Title level={3} style={{ marginBottom: 8 }}>
            {AUTH.LOGIN.LABELS.SUBMIT}
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 32 }}>
            Acesse com suas credenciais corporativas.
          </Typography.Paragraph>
          <Form<LoginFormValues>
            layout="vertical"
            onFinish={onSubmit}
            initialValues={{ remember: true }}
            disabled={submitting}
          >
            <Form.Item
              label={AUTH.LOGIN.LABELS.LOGIN}
              name="login"
              rules={[
                {
                  required: true,
                  message: AUTH.LOGIN.VALIDATION_MESSAGES.LOGIN_REQUIRED,
                },
              ]}
            >
              <Input
                placeholder={AUTH.LOGIN.PLACEHOLDERS.LOGIN}
                autoComplete="username"
                autoFocus
              />
            </Form.Item>
            <Form.Item
              label={AUTH.LOGIN.LABELS.PASSWORD}
              name="password"
              rules={[
                {
                  required: true,
                  message: AUTH.LOGIN.VALIDATION_MESSAGES.PASSWORD_REQUIRED,
                },
                {
                  min: PASSWORD_MIN_LENGTH,
                  message:
                    AUTH.LOGIN.VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH(PASSWORD_MIN_LENGTH),
                },
              ]}
            >
              <Input.Password
                placeholder={AUTH.LOGIN.PLACEHOLDERS.PASSWORD}
                autoComplete="current-password"
              />
            </Form.Item>
            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>{AUTH.LOGIN.LABELS.REMEMBER}</Checkbox>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={submitting}>
                {AUTH.LOGIN.BUTTONS.SUBMIT}
              </Button>
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Tooltip title={AUTH.LOGIN.LABELS.SSO_TOOLTIP}>
                <Button block disabled>
                  {AUTH.LOGIN.LABELS.SSO}
                </Button>
              </Tooltip>
            </Form.Item>
          </Form>
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Link href="/esqueci-senha">{AUTH.LOGIN.LABELS.FORGOT_PASSWORD}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
