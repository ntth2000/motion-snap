import { GithubOutlined } from '@ant-design/icons';
import { Layout, Typography, Button } from 'antd';
import { useTranslation } from 'react-i18next';

const { Footer } = Layout;
const { Text } = Typography;

export default function AppFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <Footer className="footer">
      <div className="content">
        <Text type="secondary" style={{ maxWidth: '80%', marginRight: '16px' }}>
          {t('footer.description', { year })}
        </Text>
        <Button
          color="default"
          variant='link'
          style={{ fontSize: 24 }}
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
