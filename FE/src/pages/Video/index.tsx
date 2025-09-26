import { Typography } from 'antd'
import AppLayout from '../../layout/AppLayout'

export default function VideoPage() {
    const userName = 'Alice'

    return (
        <AppLayout userName={userName}>
            <div>
                <Typography.Title level={4}>Video Page</Typography.Title>
                <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
                    This is a placeholder for /video/:id
                </Typography.Paragraph>
            </div>
        </AppLayout>
    )
}