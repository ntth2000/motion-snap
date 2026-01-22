import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

export default function CommentAuthOverlay() {
  const navigate = useNavigate();


  return (
    <div className='absolute top-0 left-0 right-0 bottom-0'>
      <div
        className='inset-0 absolute flex items-center justify-center flex-col gap-4 rounded-sm bg-[rgba(255,255,255,0.6)]'
      >
        <Text type='secondary'>Login to leave a comment</Text>
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
