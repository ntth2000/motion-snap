import { Typography } from 'antd';
import AppLayout from '../../layout/AppLayout';
import UploadVideo from '../../components/UploadVideo';

export default function DashboardPage() {
  const userName = 'Alice';

  return (
    <AppLayout userName={userName}>
      <div style={{ height: '100%' }}>
        <UploadVideo />
      </div>
    </AppLayout>
  );
}
