import { LogoutOutlined, PlusSquareOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import {
  Avatar,
  Button,
  Dropdown,
  Space,
  Typography,
} from 'antd';
import { Header } from 'antd/es/layout/layout';
import { useNavigate } from 'react-router';

import useAuth from '../../hooks/useAuth';
import { eventEmitter } from '../../utils/eventEmitter';
import UploadVideo from '../UploadVideo';
const { Text } = Typography;

interface TopbarProps {
  userName: string;
}

const getInitial = (name: string) =>
  name?.trim()?.charAt(0)?.toUpperCase() || '?';

export default function Topbar({ userName }: TopbarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

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
      key: 'api-key',
      label: (
        <Text style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '16px' }}>Settings</span>
          <SettingOutlined />
        </Text>
      ),
      onClick: () => navigate('/settings'),
    },
    {
      key: 'logout',
      label: (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ marginRight: '12px', fontSize: '16px' }}>Logout</Text>
          <LogoutOutlined />
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
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
                Upload
              </span>
            </Button>
            <Dropdown
              menu={{ items }}
              trigger={['click']}
              placement="bottomRight"
              overlayStyle={{ minWidth: '60px' }}
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar className="avatar" style={{ marginBottom: '2px' }}>
                  {getInitial(userName)}
                </Avatar>
              </Space>
            </Dropdown>
          </div>
        </div>
      </Header>
    </>
  );
}
