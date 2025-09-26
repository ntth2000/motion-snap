import { Layout, Typography, Dropdown, Avatar, Space } from 'antd'
import type { MenuProps } from 'antd'
import { Header } from 'antd/es/layout/layout'

interface TopbarProps {
    userName: string
}

const getInitial = (name: string) => (name?.trim()?.charAt(0)?.toUpperCase() || '?')

export default function Topbar({ userName }: TopbarProps) {
    const onLogout = () => {
        console.log('logout')
    }
    const items: MenuProps['items'] = [
        {
            key: 'logout',
            label: 'Log out',
            onClick: () => onLogout?.(),
        },
    ]

    return (
        <Header style={{
            backgroundColor: "#fff",
            position: 'sticky',
            top: 0,
            zIndex: 100,
            width: '100%',
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            paddingInline: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            <Typography.Text strong style={{ fontSize: 18 }}>MotionSnap</Typography.Text>
            <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
                <Space style={{ cursor: 'pointer' }}>
                    <Typography.Text>{userName}</Typography.Text>
                    <Avatar className="avatar">
                        {getInitial(userName)}
                    </Avatar>
                </Space>
            </Dropdown>
        </Header>
    )
}
