import { GithubOutlined } from '@ant-design/icons';
import { Button,Layout, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Footer } = Layout;
const { Text } = Typography;

export default function AppFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <Footer className='bg-white! mt-10!'>
      <div className="w-full flex flex-row justify-between">
        <Text type="secondary" className='max-w-4/5 mr-4'>
          {t('footer.description', { year })}
        </Text>
        <Button
          color="default"
          variant='link'
          className='text-2xl!'
          onClick={() =>
            window.open('https://github.com/ntth2000/motion-snap', '_blank')
          }
        >
          <GithubOutlined />
        </Button>

      </div>
    </Footer>
  );
}
