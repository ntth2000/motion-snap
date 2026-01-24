import {
  KeyOutlined,
  LogoutOutlined,
  PlusSquareOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Avatar, Button, Dropdown, Layout, Modal, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import useAuth from '../../../hooks/useAuth';
import { eventEmitter } from '../../../utils/eventEmitter';
import { getFirstChar } from '../../../utils/util';
import ApiKeySetting from '../../ApiKeySetting';
import CreatePostModal from '../../CreatePostModal';
import Logo from '../../UI/Logo';

const { Header } = Layout;
const { Title } = Typography;

export default function Topbar() {
  const { t } = useTranslation();
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location?.pathname || '';
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isCreatePostModelOpen, setIsCreatePostModelOpen] = useState<boolean>(false);

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

  const menuItems: MenuProps['items'] = useMemo(() =>
    user?.role === 'ADMIN' ? [{
      key: 'logout',
      label: (
        <div className="flex items-center gap-2 text-red-500">
          <LogoutOutlined />
          <span>{t('topbar.menu.logout')}</span>
        </div>
      ),
      onClick: onLogout,
    }] : [
      {
        key: 'profile',
        label: (
          <div className="flex items-center gap-2">
            <UserOutlined />
            <span>{t('topbar.menu.profile')}</span>
          </div>
        ),
        onClick: () => navigate(`/profile/${user?.username}`),
      },
      {
        key: 'api-key',
        label: (
          <div className="flex items-center gap-2">
            <SettingOutlined />
            <span>{t('topbar.menu.apiKey')}</span>
          </div>
        ),
        onClick: () => setIsApiKeyModalOpen(true),
      },
      {
        key: 'logout',
        label: (
          <div className="flex items-center gap-2 text-red-500">
            <LogoutOutlined />
            <span>{t('topbar.menu.logout')}</span>
          </div>
        ),
        onClick: onLogout,
      },
    ], [user]);

  const navLinks = useMemo(() => [
    {
      path: '/',
      label: t('topbar.home'),
      show: true,
    },
    {
      path: '/my-videos',
      label: t('topbar.myVideos'),
      show: isAuthenticated && user?.role === "USER",
    }
  ], [isAuthenticated]);

  return (
    <>
      <CreatePostModal />
      {isApiKeyModalOpen &&
        <Modal
          open={isApiKeyModalOpen}
          onCancel={() => setIsApiKeyModalOpen(false)}
          title={
            <Title level={5}>
              <KeyOutlined />
              <span className='ml-2'>{t('apiKeySetting.title')}</span>
            </Title>
          }
          footer={<Button onClick={() => setIsApiKeyModalOpen(false)}>{t('common.close')}</Button>}
          width={800}
          height={400}
          centered
          maskClosable={false}
          styles={{ body: { padding: '24px 24px 0 24px' } }}>
          <ApiKeySetting />
        </Modal>}
      <Header className="sticky top-0 flex w-full items-center justify-between border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-10">
          <div
            className="group flex cursor-pointer items-center gap-2"
            onClick={() => navigate('/')}
          >
            <Logo />
            <p className="text-xl font-semibold">
              MotionSnap
            </p>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map(
              (link) =>
                link.show && (
                  <div
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={`cursor-pointer
                      ${pathname === link.path ? 'text-primary' : 'hover:text-primary text-secondary'}`}
                  >
                    {link.label}
                  </div>
                )
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {user?.role !== 'ADMIN' && <Button
                className="!flex items-center !font-medium uppercase"
                icon={<PlusSquareOutlined />}
                onClick={showModal}
              >
                {t('topbar.upload')}
              </Button>
              }

              <Dropdown
                menu={{ items: menuItems }}
                trigger={['click']}
                placement="bottomRight"
                overlayClassName="min-w-[160px]"
              >
                <div className="cursor-pointer transition-opacity hover:opacity-80">
                  <Avatar
                    className="!bg-primary/10 !text-primary !font-bold border border-primary/20"
                    size="large"
                  >
                    {getFirstChar("abc")}
                  </Avatar>
                </div>
              </Dropdown>
            </>
          ) : (
            <Button
              type="text"
              onClick={() => navigate('/login')}
            >
              {t('topbar.login')}
            </Button>
          )}
        </div>
      </Header>
    </>
  );
}
