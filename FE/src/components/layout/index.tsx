import { Layout } from 'antd';
import { type PropsWithChildren } from 'react';

import Footer from './Footer';
import Topbar from './Topbar';

const { Content } = Layout;

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <Layout className="min-h-screen">
      <div className="sticky top-0 z-1000">
        <Topbar />
      </div>

      <Content className="flex-1 overflow-auto py-8!">
        <div
          className="px-[50px] mx-auto! w-full min-h-[calc(100vh-128px)] flex flex-col"
        >
          {children}
        </div>
      </Content>

      <Footer />
    </Layout>
  );
}
