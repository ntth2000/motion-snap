import { CloudUploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { Input, Typography, Upload } from 'antd';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// Import CSS Module
import styles from './CreatePostModal.module.css';

const { Dragger } = Upload;
const { Text } = Typography;
const { TextArea } = Input;

interface SingleViewProps {
  files: UploadFile[];
  setFiles: (files: UploadFile[]) => void;
  caption: string;
  setCaption: (val: string) => void;
  onUploadSuccess: () => void;
  step: 'upload' | 'preview';
}

const VideoPlayer = React.memo(({ file, className }: { file: File, className: string }) => {
  const videoUrl = useMemo(() => {
    return URL.createObjectURL(file);
  }, [file]);

  return (
    <div className={`relative w-full h-full bg-black rounded-lg overflow-hidden ${className}`}>
      <video
        src={videoUrl}
        controls
        className="w-full h-full object-contain"
      />
    </div>
  );
});

export const SingleView: React.FC<SingleViewProps> = ({
  files, setFiles, caption, setCaption, onUploadSuccess, step
}) => {
  const { t } = useTranslation();
  const handleUpload = (file: File) => {
    const uploadFile: UploadFile = {
      uid: file.name + Date.now(),
      name: file.name,
      status: 'done',
      originFileObj: file,
    };
    setFiles([uploadFile]);
    setTimeout(onUploadSuccess, 500);
    return false;
  };

  if (step === 'upload') {
    return <div>
      <div className={`text-center mb-6`}>
        <Text className='font-medium text-lg!'>{t("uploadModal.single.title")}</Text>
        <div className="mt-2">
          <Text type="secondary">{t("uploadModal.single.description")}</Text>
        </div>
      </div>
      <div className="flex flex-col animate-[fadeIn_0.3s_ease-in-out]">
        <div className="h-64">
          <Dragger
            name="file"
            multiple={false}
            showUploadList={false}
            beforeUpload={handleUpload}
          >
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="">
                <CloudUploadOutlined className="text-5xl text-primary!" />
              </div>
              <div>
                <p className="text-secondary px-4">
                  {t('uploadModal.dragDrop')}
                  <br />
                  {t('uploadModal.description')}
                </p>
              </div>
            </div>
          </Dragger>
        </div >
      </div >
    </div>
  }

  return (
    <div className={`${styles.fadeIn} ${styles.previewContainer}`}>
      <div className={styles.previewLeft}>
        <div className={styles.previewHeader}>
          <Text type="secondary" className={styles.previewLabel}>PREVIEW</Text>
        </div>
        <div className={styles.videoWrapper}>
          <VideoPlayer
            file={files[0].originFileObj as File}
            className={styles.videoContent}
          />
        </div>
      </div>

      <div className={styles.previewRight}>
        <Text strong className={styles.mb8}>Caption</Text>
        <TextArea
          rows={6}
          placeholder="Describe the object..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className={styles.captionArea}
          showCount
          maxLength={200}
        />
        <div className={styles.fileInfoBox}>
          <Text strong className={styles.fileInfoLabel}>File:</Text>
          <div className={styles.fileName}>{files[0]?.name}</div>
        </div>
      </div>
    </div >
  );
};