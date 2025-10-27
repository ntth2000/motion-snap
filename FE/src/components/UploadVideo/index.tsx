import { UploadOutlined } from '@ant-design/icons';
import { Button, UploadFile, UploadProps, Upload, Typography } from 'antd';
import { useState } from 'react';
const { Text, Title } = Typography;
const UploadVideo: React.FC = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([
    {
      uid: '-1',
      name: 'xxx.png',
      status: 'done',
      url: 'http://www.baidu.com/xxx.png',
    },
  ]);
  const handleChange: UploadProps['onChange'] = (info) => {
    let newFileList = [...info.fileList];

    // 1. Limit the number of uploaded files
    // Only to show two recent uploaded files, and old ones will be replaced by the new
    newFileList = newFileList.slice(-2);

    // 2. Read from response and show file link
    newFileList = newFileList.map((file) => {
      if (file.response) {
        // Component will show file.url as link
        file.url = file.response.url;
      }
      return file;
    });

    setFileList(newFileList);
  };
  const props = {
    action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
    onChange: handleChange,
    multiple: true,
  };
  return (
    <Upload.Dragger {...props}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px 0',
        }}
      >
        <div
          style={{
            fontSize: 32,
            borderRadius: '100%',
            backgroundColor: '#eee',
            display: 'flex',
            justifyContent: 'center',
            padding: '16px',
            marginBottom: '12px',
          }}
        >
          <UploadOutlined />
        </div>
        <Title level={5}>Select a video</Title>
        <Text type="secondary">Or drag & drop to upload</Text>
        <Text type="secondary" style={{ fontSize: 16, marginTop: '60px' }}>
          Supported file types: MP4, GIF, WMV
        </Text>
      </div>
    </Upload.Dragger>
  );
};

export default UploadVideo;
