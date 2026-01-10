import { HomeOutlined, LogoutOutlined, PlusSquareOutlined, SettingOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import {
  Avatar,
  Button,
  Dropdown,
  Space,
  Typography,
  Tooltip,
} from 'antd';
import { Header } from 'antd/es/layout/layout';
import { useNavigate, useLocation } from 'react-router';
import useAuth from '../../../hooks/useAuth';
import UploadVideo from '../../UploadVideo';
import { eventEmitter } from '../../../utils/eventEmitter';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

interface TopbarProps {
  userName: string;
}

const getInitial = (name: string) =>
  name?.trim()?.charAt(0)?.toUpperCase() || '?';

export default function Topbar({ userName }: TopbarProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location?.pathname || '';

  const onLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const showModal = () => {
    eventEmitter.emit('open-upload-video-modal');
  };

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      label: (
        <div
          style={{
            display: 'flex',
            justifyContent: 'start',
            alignItems: 'center',
          }}
        >
          <UserOutlined />
          <Text style={{ paddingLeft: 8 }}>{t('topbar.menu.profile')}</Text>
        </div>
      ),
      onClick: () => navigate('/settings'),
    },
    {
      key: 'api-key',
      label: (
        <div
          style={{
            display: 'flex',
            justifyContent: 'start',
            alignItems: 'center',
          }}
        >
          <SettingOutlined />
          <Text style={{ paddingLeft: 8 }}>{t('topbar.menu.settings')}</Text>
        </div>
      ),
      onClick: () => navigate('/settings'),
    },
    {
      key: 'logout',
      label: (
        <div
          style={{
            display: 'flex',
            justifyContent: 'start',
            alignItems: 'center',
          }}
        >
          <LogoutOutlined />
          <Text style={{ paddingLeft: 8 }}>
            {t('topbar.menu.logout')}
          </Text>
        </div>
      ),
      onClick: () => onLogout?.(),
    },
  ];

  return (
    <>
      <UploadVideo />
      <Header>
        <div className="topbar">
          <div>
            <Typography.Text strong style={{ fontSize: 20, cursor: 'pointer' }} onClick={() => navigate('/')}>
              MotionSnap
            </Typography.Text>
          </div>
          <div style={{ fontSize: 24 }}>
            <Tooltip title="Home">
              <HomeOutlined
                onClick={() => navigate('/')}
                style={{
                  marginRight: 24,
                  cursor: 'pointer',
                  color: pathname === '/' ? '#1890ff' : "#ccc",
                }}
              />
            </Tooltip>
            {isAuthenticated &&
              <Tooltip title="My Videos">
                <VideoCameraOutlined
                  onClick={() => navigate('/my/videos')}
                  style={{
                    cursor: 'pointer',
                    color: pathname === '/my/videos' ? '#1890ff' : "#ccc",
                  }}
                />
              </Tooltip>
            }
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {isAuthenticated ?
              <>
                <Button
                  color="default"
                  variant="outlined"
                  style={{
                    padding: '12px',
                    marginRight: '16px',
                  }}
                  onClick={showModal}
                >
                  <PlusSquareOutlined />
                  <span
                    style={{
                      textTransform: 'uppercase',
                      fontWeight: '500',
                      fontSize: '16px',
                      marginLeft: '2px',
                      marginBottom: '1px',
                    }}
                  >
                    {t('topbar.upload')}
                  </span>
                </Button>

                <Dropdown
                  menu={{ items }}
                  trigger={['click']}
                  placement="bottomRight"
                  overlayStyle={{ minWidth: '130px' }}
                >
                  <Space style={{ cursor: 'pointer' }}>
                    <Avatar className="avatar" style={{ marginBottom: '2px' }}>
                      {getInitial(userName)}
                    </Avatar>
                  </Space>
                </Dropdown>
              </>
              :
              <Button color="default"
                variant="link"
                onClick={() => { navigate('/login') }}
              >
                {t('topbar.login')}
              </Button>
            }
          </div>
        </div>
      </Header>
    </>
  );
}
