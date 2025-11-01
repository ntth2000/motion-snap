import { Button, Typography } from 'antd';

export default function Home() {
  return (
    <div>
      <div>
        <Typography.Title level={2} style={{ margin: '16px' }}>
          You have no videos
        </Typography.Title>
        <Button type="primary" onClick={() => {}}>
          Click here to upload your first video
        </Button>
      </div>
    </div>
  );
}
