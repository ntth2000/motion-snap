import { Layout } from 'antd'
import type { PropsWithChildren } from 'react'
import Topbar from '../../components/Topbar'

interface AppLayoutProps {
  userName: string
}

export default function AppLayout({ children, userName }: PropsWithChildren<AppLayoutProps>) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Topbar userName={userName} />
      <Layout.Content style={{ padding: 16 }}>
        {children}
      </Layout.Content>
    </Layout>
  )
}
