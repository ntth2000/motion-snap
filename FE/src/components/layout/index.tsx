import { Layout, theme } from 'antd';
import { type PropsWithChildren } from 'react';

import useAuth from '../../hooks/useAuth';
import Topbar from './Topbar';

const { Header, Content } = Layout;

export default function AppLayout({ children }: PropsWithChildren) {
  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  const { user } = useAuth();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          padding: 0,
          background: '#fff',
        }}
      >
        <Topbar userName={user?.username || ''} />
      </Header>

      <Content
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            width: '100%',
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </div>
      </Content>
    </Layout>
  );
}
