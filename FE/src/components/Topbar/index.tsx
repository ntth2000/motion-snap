import { PlusSquareOutlined } from '@ant-design/icons';
import { Button, Typography, Dropdown, Avatar, Space, Modal } from 'antd';
import type { MenuProps } from 'antd';
import { Header } from 'antd/es/layout/layout';
import { useState } from 'react';
import UploadVideo from '../UploadVideo';

interface TopbarProps {
  userName: string;
}

const getInitial = (name: string) =>
  name?.trim()?.charAt(0)?.toUpperCase() || '?';

export default function Topbar({ userName }: TopbarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onLogout = () => {
    console.log('logout');
  };
  const items: MenuProps['items'] = [
    {
      key: 'logout',
      label: 'Log out',
      onClick: () => onLogout?.(),
    },
  ];

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Modal
        centered
        title="Upload a video"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <UploadVideo />
      </Modal>
      <Header>
        <div className="topbar">
          <div className="">
            <Typography.Text strong style={{ fontSize: 18 }}>
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
            >
              <Space style={{ cursor: 'pointer' }}>
                {/* <Typography.Text>{userName}</Typography.Text> */}
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
