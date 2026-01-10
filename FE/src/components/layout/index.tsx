import { Layout, theme } from 'antd';
import { type PropsWithChildren } from 'react';

import useAuth from '../../hooks/useAuth';
import Topbar from './Topbar';
import Footer from './Footer';

const { Content } = Layout;

export default function AppLayout({ children }: PropsWithChildren) {
  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  const { user } = useAuth();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          padding: 0,
        }}
      >
        <Topbar userName={user?.username || ''} />
      </div>

      <Content
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '32px 0',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            width: '100%',
            borderRadius: borderRadiusLG,
            minHeight: 'calc(100vh - 128px)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {children}
        </div>
      </Content>

      <Footer />
    </Layout>
  );
}
