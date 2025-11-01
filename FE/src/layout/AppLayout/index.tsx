import { Layout, theme } from 'antd';
import type { PropsWithChildren } from 'react';
import Topbar from '../../components/Topbar';

interface AppLayoutProps {
  userName: string;
}

export default function AppLayout({
  children,
  userName,
}: PropsWithChildren<AppLayoutProps>) {
  const {
    token: { borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Topbar userName={userName} />
      <div
        style={{
          margin: '0 48px',
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            margin: '24px 0',
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </div>
      </div>
    </Layout>
  );
}
