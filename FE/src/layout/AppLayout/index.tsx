import { Breadcrumb, Layout, theme } from 'antd';
import type { PropsWithChildren } from 'react';
import Topbar from '../../components/Topbar';
import { HomeOutlined, UserOutlined } from '@ant-design/icons';

interface AppLayoutProps {
  userName: string;
}

export default function AppLayout({
  children,
  userName,
}: PropsWithChildren<AppLayoutProps>) {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Topbar userName={userName} />
      <div
        style={{
          padding: '0 48px',
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
        }}
      >
        <Breadcrumb
          items={[
            {
              href: '',
              title: <HomeOutlined />,
            },
            {
              href: '',
              title: (
                <>
                  <UserOutlined />
                  <span>Video list</span>
                </>
              ),
            },
            {
              title: 'Application',
            },
          ]}
          style={{ margin: '16px 0' }}
        />
        <Layout
          style={{
            padding: '24px 0',
            marginBottom: '24px',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Layout>
      </div>
    </Layout>
  );
}
