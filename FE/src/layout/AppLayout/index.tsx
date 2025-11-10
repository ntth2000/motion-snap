import { Layout, theme } from 'antd';
import { useEffect, useState, type PropsWithChildren } from 'react';
import Topbar from '../../components/Topbar';
import { getMe } from '../../services/authService';

export default function AppLayout({ children }: PropsWithChildren) {
  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  const [userName, setUserName] = useState("");
  useEffect(() => {
    const getUserName = async () => {
      const res = await getMe();
      setUserName(res.username);
    }
    getUserName();
  }, []);

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Topbar userName={userName} />
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
