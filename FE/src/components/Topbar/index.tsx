import { LogoutOutlined, PlusSquareOutlined } from '@ant-design/icons';
import {
  Button,
  Typography,
  Dropdown,
  Avatar,
  Space,
  Modal,
  Steps
} from 'antd';
import type { MenuProps } from 'antd';
import { Header } from 'antd/es/layout/layout';
import { useState } from 'react';
import UploadVideo from '../UploadVideo';
const { Text } = Typography;

interface TopbarProps {
  userName: string;
}

const getInitial = (name: string) =>
  name?.trim()?.charAt(0)?.toUpperCase() || '?';

export default function Topbar({ userName }: TopbarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { id: 1, title: 'Select video', disabled: false },
    { id: 2, title: 'Details', disabled: currentStep < 1 },
    { id: 3, title: 'Upload', disabled: currentStep < 2 },
    { id: 4, title: 'Extract', disabled: currentStep < 3 },
    { id: 5, title: 'Draw poses', disabled: currentStep < 4 },
  ]

  const onLogout = () => {
    console.log('logout');
  };

  const onChangeSteps = (value: number) => {
    setCurrentStep(value);
  }

  const items: MenuProps['items'] = [
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

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleUploadVideo = () => {
    console.log('Upload video');
  };

  const handleClickLogo = () => { };

  const customModalFooter = [
    <Button key="cancel" onClick={handleCancel}>
      Cancel
    </Button>,
    <Button key="upload" type="primary" onClick={handleUploadVideo}>
      Upload
    </Button>,
  ]

  return (
    <>
      <Modal
        centered
        title="Upload new video"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={currentStep > 0 ? customModalFooter : null}
        width="70%"
        styles={{
          body: {
            height: "70vh",
            maxHeight: 820,
            overflowY: "auto",
          }
        }}
      >
        <div style={{ marginBottom: '32px' }}>
          <Steps
            size="small"
            current={currentStep}
            onChange={onChangeSteps}
            items={steps}
            type="navigation"
          />
        </div>
        <UploadVideo onChangeSteps={onChangeSteps} />
      </Modal>
      <Header>
        <div className="topbar">
          <div className="" onClick={handleClickLogo}>
            <Typography.Text strong style={{ fontSize: 20, cursor: 'pointer' }}>
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
