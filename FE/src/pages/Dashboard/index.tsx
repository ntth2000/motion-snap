import { Typography } from 'antd';
import AppLayout from '../../layout/AppLayout';

export default function DashboardPage() {
  const userName = 'Alice';

  return (
    <AppLayout userName={userName}>
      <div>
        <Typography.Title level={4}>Welcome back, {userName}</Typography.Title>
        <Typography.Paragraph type="secondary">
          This is your dashboard.
        </Typography.Paragraph>
      </div>
    </AppLayout>
  );
}
