import VideoList from '../../components/VideoList';
import AppLayout from '../../components/layout';

export default function Feed() {

  return (
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
  );
}
