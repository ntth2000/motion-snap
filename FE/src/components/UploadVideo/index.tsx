import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload, Typography } from 'antd';
import { useState } from 'react';
const { Text } = Typography;
const UploadVideo: React.FC = () => {
  const [fileList, setFileList] = useState<any[]>([
    {
      uid: '-1',
      name: 'xxx.png',
      status: 'done',
      url: 'http://www.baidu.com/xxx.png',
    },
  ]);
  const handleChange = (info: any) => {
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
          padding: '16px 0',
        }}
      >
        <div>
          <UploadOutlined />
        </div>
        <Text strong>Select a file to upload</Text>
        <p>Or drag and drop a video file</p>
      </div>
    </Upload.Dragger>
  );
};

export default UploadVideo;
