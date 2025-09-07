import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Link,
  Img,
  Hr,
} from '@react-email/components';

interface BaseEmailLayoutProps {
  children: React.ReactNode;
  title?: string;
  preview?: string;
}

export const BaseEmailLayout: React.FC<BaseEmailLayoutProps> = ({
  children,
  title = "Panickin' Skywalker",
  preview
}) => (
  <Html>
    <Head>
      <title>{title}</title>
      {preview && <meta name="description" content={preview} />}
    </Head>
    <Body style={bodyStyle}>
      <Container style={containerStyle}>
        {/* Header */}
        <Section style={headerStyle}>
          <Row>
            <Column style={logoColumnStyle}>
              <Img
                src="https://your-domain.com/logo.png"
                alt="Panickin' Skywalker"
                width={200}
                height={60}
                style={logoStyle}
              />
            </Column>
            <Column style={socialColumnStyle}>
              <Text style={socialTextStyle}>Follow Us</Text>
              <Link href="https://instagram.com/panickinskywalker" style={socialLinkStyle}>
                Instagram
              </Link>
              <Text style={socialSeparatorStyle}>•</Text>
              <Link href="https://facebook.com/panickinskywalker" style={socialLinkStyle}>
                Facebook
              </Link>
              <Text style={socialSeparatorStyle}>•</Text>
              <Link href="https://twitter.com/panickinskywalker" style={socialLinkStyle}>
                Twitter
              </Link>
            </Column>
          </Row>
        </Section>

        {/* Main Content */}
        <Section style={contentStyle}>
          {children}
        </Section>

        {/* Footer */}
        <Section style={footerStyle}>
          <Hr style={hrStyle} />
          <Row>
            <Column style={footerColumnStyle}>
              <Text style={footerTextStyle}>
                <strong>Panickin' Skywalker</strong><br />
                The anxious superhero band bringing you epic tunes and merch!
              </Text>
              <Text style={footerTextStyle}>
                📧 <Link href="mailto:support@panickinskywalker.com" style={footerLinkStyle}>
                  support@panickinskywalker.com
                </Link>
              </Text>
              <Text style={footerTextStyle}>
                🎵 <Link href="https://panickinskywalker.com" style={footerLinkStyle}>
                  panickinskywalker.com
                </Link>
              </Text>
            </Column>
          </Row>
          
          <Row style={{ marginTop: '20px' }}>
            <Column>
              <Text style={disclaimerTextStyle}>
                Don't panic! This email was sent because you made a purchase or signed up for our newsletter. 
                If you no longer want to receive these emails, you can{' '}
                <Link href="#unsubscribe" style={footerLinkStyle}>unsubscribe here</Link>.
              </Text>
              <Text style={disclaimerTextStyle}>
                © 2024 Panickin' Skywalker. All rights reserved. 
                Even superheroes need to protect their intellectual property!
              </Text>
            </Column>
          </Row>
        </Section>
      </Container>
    </Body>
  </Html>
);

// Styles with Panickin' Skywalker branding
const bodyStyle = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  backgroundColor: '#f8fafc',
  margin: '0',
  padding: '0',
};

const containerStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const headerStyle = {
  backgroundColor: '#1e293b', // Dark blue/gray for superhero theme
  padding: '20px',
};

const logoColumnStyle = {
  width: '60%',
  verticalAlign: 'middle',
};

const logoStyle = {
  maxWidth: '100%',
  height: 'auto',
};

const socialColumnStyle = {
  width: '40%',
  verticalAlign: 'middle',
  textAlign: 'right' as const,
};

const socialTextStyle = {
  color: '#e2e8f0',
  fontSize: '12px',
  marginBottom: '8px',
};

const socialLinkStyle = {
  color: '#3b82f6', // Blue accent color
  fontSize: '12px',
  textDecoration: 'none',
  fontWeight: '500',
};

const socialSeparatorStyle = {
  color: '#64748b',
  fontSize: '12px',
  margin: '0 8px',
};

const contentStyle = {
  padding: '40px 30px',
  lineHeight: '1.6',
};

const footerStyle = {
  backgroundColor: '#f1f5f9',
  padding: '30px',
};

const footerColumnStyle = {
  textAlign: 'center' as const,
};

const footerTextStyle = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '8px 0',
};

const footerLinkStyle = {
  color: '#3b82f6',
  textDecoration: 'none',
};

const disclaimerTextStyle = {
  color: '#94a3b8',
  fontSize: '12px',
  lineHeight: '1.4',
  textAlign: 'center' as const,
  margin: '8px 0',
};

const hrStyle = {
  border: 'none',
  borderTop: '1px solid #e2e8f0',
  margin: '0 0 20px 0',
};

export default BaseEmailLayout;