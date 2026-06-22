'use client';

import {
  ApiOutlined,
  DatabaseOutlined,
  GithubOutlined,
  LoginOutlined,
  PlayCircleOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Col, Descriptions, Row, Space, Typography } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import njLogo from '@/assets/logo/NJPlastic-logo-a-128px.png';
import { LANDING } from '@/constants/ConstantsAndParams';
import { useResponsive } from '@/hooks/useResponsive';
import { njPalette } from '@/theme/njTheme';

const { Title, Paragraph, Text } = Typography;

const PILLAR_ICONS = [
  <ApiOutlined key="api" />,
  <RocketOutlined key="rocket" />,
  <DatabaseOutlined key="database" />,
];

const SECTION_PADDING: CSSProperties = {
  padding: '72px 24px',
};

const CONTAINER: CSSProperties = {
  maxWidth: 1120,
  margin: '0 auto',
  width: '100%',
};

export default function LandingPage() {
  const { isMobile } = useResponsive();
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${njPalette.bone}`,
        }}
      >
        <div
          style={{
            ...CONTAINER,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '12px 16px' : '12px 24px',
            gap: 12,
            flexWrap: 'nowrap',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: 'inherit',
              minWidth: 0,
              flexShrink: 1,
            }}
          >
            <Image
              src={njLogo}
              alt="NJPlastic"
              width={isMobile ? 32 : 40}
              height={isMobile ? 32 : 40}
              priority
              style={{ flexShrink: 0 }}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                lineHeight: 1.1,
                minWidth: 0,
              }}
            >
              <Text
                strong
                style={{
                  fontSize: isMobile ? 15 : 18,
                  color: njPalette.charcoal,
                  whiteSpace: 'nowrap',
                }}
              >
                {LANDING.TOPBAR.BRAND}
              </Text>
              {!isMobile ? (
                <Text style={{ fontSize: 12, color: njPalette.warmGray, whiteSpace: 'nowrap' }}>
                  {LANDING.TOPBAR.BRAND_TAGLINE}
                </Text>
              ) : null}
            </div>
          </Link>
          {!isMobile ? (
            <Space size={24} className="landing-nav">
              <a href="#sobre" style={{ color: njPalette.charcoal }}>
                {LANDING.TOPBAR.NAV.ABOUT}
              </a>
              <a href="#video" style={{ color: njPalette.charcoal }}>
                {LANDING.TOPBAR.NAV.VIDEO}
              </a>
              <a href="#acesso" style={{ color: njPalette.charcoal }}>
                {LANDING.TOPBAR.NAV.DEMO_ACCESS}
              </a>
              <a href="#repositorio" style={{ color: njPalette.charcoal }}>
                {LANDING.TOPBAR.NAV.REPO}
              </a>
            </Space>
          ) : null}
          <Link href="/login" style={{ flexShrink: 0 }}>
            <Button type="primary" icon={<LoginOutlined />} size={isMobile ? 'small' : 'middle'}>
              {LANDING.TOPBAR.CTA_LOGIN}
            </Button>
          </Link>
        </div>
      </header>

      <section
        style={{
          background: njPalette.tealDeep,
          color: '#ffffff',
          padding: '96px 24px',
        }}
      >
        <div style={CONTAINER}>
          <Text style={{ color: njPalette.bone, letterSpacing: 1.6, fontSize: 13 }}>
            {LANDING.HERO.EYEBROW.toUpperCase()}
          </Text>
          <Title
            level={1}
            style={{ color: '#ffffff', marginTop: 12, fontSize: 44, lineHeight: 1.15 }}
          >
            {LANDING.HERO.TITLE}
          </Title>
          <Paragraph
            style={{ color: '#ffffff', maxWidth: 720, fontSize: 17, opacity: 0.92 }}
          >
            {LANDING.HERO.TAGLINE}
          </Paragraph>
          <Space size={12} wrap style={{ marginTop: 24 }}>
            <Link href="/login">
              <Button type="primary" size="large" icon={<LoginOutlined />}>
                {LANDING.HERO.PRIMARY_CTA}
              </Button>
            </Link>
            <Button
              size="large"
              ghost
              icon={<GithubOutlined />}
              href={LANDING.REPO.URL}
              target="_blank"
              rel="noreferrer"
            >
              {LANDING.HERO.SECONDARY_CTA}
            </Button>
          </Space>
        </div>
      </section>

      <section id="sobre" style={{ ...SECTION_PADDING, background: '#ffffff' }}>
        <div style={CONTAINER}>
          <Title level={2} style={{ marginBottom: 8 }}>
            {LANDING.ABOUT.TITLE}
          </Title>
          <Paragraph style={{ fontSize: 16, maxWidth: 880, color: njPalette.charcoal }}>
            {LANDING.ABOUT.INTRO}
          </Paragraph>
          <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
            {LANDING.ABOUT.PILLARS.map((pillar, index) => (
              <Col key={pillar.TITLE} xs={24} md={8}>
                <Card style={{ height: '100%' }}>
                  <div
                    style={{
                      fontSize: 28,
                      color: njPalette.cobalt,
                      marginBottom: 12,
                    }}
                  >
                    {PILLAR_ICONS[index]}
                  </div>
                  <Title level={4} style={{ marginTop: 0 }}>
                    {pillar.TITLE}
                  </Title>
                  <Paragraph style={{ marginBottom: 0, color: njPalette.charcoal }}>
                    {pillar.DESCRIPTION}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <section id="video" style={{ ...SECTION_PADDING, background: njPalette.bone }}>
        <div style={CONTAINER}>
          <Space align="center" size={12} style={{ marginBottom: 8 }}>
            <PlayCircleOutlined style={{ fontSize: 24, color: njPalette.cobalt }} />
            <Title level={2} style={{ margin: 0 }}>
              {LANDING.VIDEO.TITLE}
            </Title>
          </Space>
          <Paragraph style={{ fontSize: 16, maxWidth: 880, color: njPalette.charcoal }}>
            {LANDING.VIDEO.DESCRIPTION}
          </Paragraph>
          <div
            style={{
              maxWidth: 880,
              margin: '24px auto 0',
              aspectRatio: '16 / 9',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 12px 32px rgba(45, 45, 42, 0.18)',
              background: '#000000',
            }}
          >
            <iframe
              src={LANDING.VIDEO.EMBED_URL}
              title={LANDING.VIDEO.IFRAME_TITLE}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block' }}
            />
          </div>
        </div>
      </section>

      <section id="acesso" style={{ ...SECTION_PADDING, background: '#ffffff' }}>
        <div style={CONTAINER}>
          <Title level={2} style={{ marginBottom: 8 }}>
            {LANDING.DEMO_ACCESS.TITLE}
          </Title>
          <Paragraph style={{ fontSize: 16, maxWidth: 880, color: njPalette.charcoal }}>
            {LANDING.DEMO_ACCESS.DESCRIPTION}
          </Paragraph>
          <Alert
            type="info"
            showIcon
            title={LANDING.DEMO_ACCESS.WARNING}
            style={{ marginBottom: 24 }}
          />
          <Row gutter={[24, 24]}>
            {(['OPERATOR', 'MANAGER'] as const).map((profileKey) => {
              const profile = LANDING.DEMO_ACCESS.PROFILES[profileKey];
              return (
                <Col key={profileKey} xs={24} md={12}>
                  <Card title={profile.TITLE} style={{ height: '100%' }}>
                    <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                      {profile.SUBTITLE}
                    </Paragraph>
                    <Descriptions column={1} bordered size="small">
                      <Descriptions.Item label={LANDING.DEMO_ACCESS.LOGIN_LABEL}>
                        <Text copyable className="font-mono">
                          {profile.LOGIN}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label={LANDING.DEMO_ACCESS.PASSWORD_LABEL}>
                        <Text copyable className="font-mono">
                          {profile.PASSWORD}
                        </Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      </section>

      <section id="repositorio" style={{ ...SECTION_PADDING, background: njPalette.bone }}>
        <div style={CONTAINER}>
          <Card>
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={4} style={{ textAlign: 'center' }}>
                <GithubOutlined style={{ fontSize: 64, color: njPalette.charcoal }} />
              </Col>
              <Col xs={24} md={14}>
                <Title level={3} style={{ marginTop: 0 }}>
                  {LANDING.REPO.TITLE}
                </Title>
                <Paragraph style={{ marginBottom: 0, color: njPalette.charcoal }}>
                  {LANDING.REPO.DESCRIPTION}
                </Paragraph>
              </Col>
              <Col xs={24} md={6} style={{ textAlign: 'right' }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<GithubOutlined />}
                  href={LANDING.REPO.URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  {LANDING.REPO.BUTTON}
                </Button>
              </Col>
            </Row>
          </Card>
        </div>
      </section>

      <footer
        style={{
          background: njPalette.charcoal,
          color: '#ffffff',
          padding: '32px 24px',
          textAlign: 'center',
        }}
      >
        <div style={CONTAINER}>
          <Text style={{ color: '#ffffff', opacity: 0.85 }}>
            {LANDING.FOOTER.PROJECT} · {LANDING.FOOTER.AUTHOR} · {LANDING.FOOTER.COURSE}
          </Text>
          <br />
          <Text style={{ color: '#ffffff', opacity: 0.6, fontSize: 12 }}>
            © {new Date().getFullYear()}
          </Text>
        </div>
      </footer>
    </div>
  );
}
