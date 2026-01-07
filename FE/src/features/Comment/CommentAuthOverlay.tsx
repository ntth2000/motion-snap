import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

export default function CommentAuthOverlay() {
  const navigate = useNavigate();


  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255,255,255,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 12,
          borderRadius: 8,
        }}
      >
        <Text>Login to leave a comment</Text>
        <Button
          type="primary"
          onClick={() => navigate('/login')}
        >
          Login
        </Button>
      </div>
    </div>
  );
}
