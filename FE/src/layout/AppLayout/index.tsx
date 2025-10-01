import { Layout } from 'antd';
import type { PropsWithChildren } from 'react';
import Topbar from '../../components/Topbar';
import BreadCrumb from '../../components/BreadCrumb';

interface AppLayoutProps {
  userName: string;
}

export default function AppLayout({
  children,
  userName,
}: PropsWithChildren<AppLayoutProps>) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Topbar userName={userName} />
      <BreadCrumb />
    </Layout>
  );
}
