import AppLayout from '../../layout/AppLayout';
import VideoList from '../../components/VideoList';

export default function DashboardPage() {

  return (
    <AppLayout>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        }}
      >
        <VideoList />
      </div>
    </AppLayout >
  );
}
