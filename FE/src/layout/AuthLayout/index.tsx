import { Layout, Row, Col, Card, Typography } from 'antd';
import type { PropsWithChildren, ReactNode } from 'react';

const { Content } = Layout;
const { Title } = Typography;

interface AuthLayoutProps {
  title?: ReactNode;
  subtitle?: ReactNode;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
}: PropsWithChildren<AuthLayoutProps>) {
  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Content>
        <Row
          justify="center"
          align="middle"
          style={{ height: '100vh', padding: 16 }}
        >
          <Col xs={24} sm={20} md={12} lg={10} xl={8} xxl={6}>
            <Card bordered style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
              {title ? (
                <Title
                  level={3}
                  style={{ marginBottom: 8, textAlign: 'center' }}
                >
                  {title}
                </Title>
              ) : null}
              {subtitle ? (
                <div
                  style={{
                    marginBottom: 24,
                    textAlign: 'center',
                    color: 'rgba(0,0,0,0.65)',
                  }}
                >
                  {subtitle}
                </div>
              ) : null}
              {children}
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
