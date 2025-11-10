import { Layout, theme } from 'antd';
import { type PropsWithChildren } from 'react';
import Topbar from '../../components/Topbar';
import useAuth from '../../hooks/useAuth';

export default function AppLayout({ children }: PropsWithChildren) {
  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  const { user } = useAuth();

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Topbar userName={user?.username || ""} />
      <div
        style={{
          margin: '16px 48px',
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
            margin: 0,
            borderRadius: borderRadiusLG,
            overflowY: 'hidden'
          }}
        >
          {children}
        </div>
      </div>
    </Layout>
  );
}
