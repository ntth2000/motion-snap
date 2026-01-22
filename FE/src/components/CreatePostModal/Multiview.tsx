import { CheckCircleOutlined, CloudUploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { Col, Input, Row, Typography, Upload } from 'antd';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// Import CSS Module
import styles from './CreatePostModal.module.css';

const { Dragger } = Upload;
const { Text } = Typography;
const { TextArea } = Input;

interface MultiViewFiles {
  view1: UploadFile[];
  view2: UploadFile[];
}

interface MultiViewProps {
  files: MultiViewFiles;
  setFiles: React.Dispatch<React.SetStateAction<MultiViewFiles>>;
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
    <div className={className}>
      <video
        src={videoUrl}
        controls
        className="w-full h-full object-contain rounded-base"
      />
    </div>
  );
});

export const MultiView: React.FC<MultiViewProps> = ({
  files, setFiles, caption, setCaption, onUploadSuccess, step
}) => {
  const { t } = useTranslation();

  const handleUpload = (file: File, type: 'view1' | 'view2') => {
    const uploadFile: UploadFile = {
      uid: file.name + Date.now(), name: file.name, status: 'done',
      originFileObj: file
    };
    setFiles(prev => {
      const newState = { ...prev, [type]: [uploadFile] };
      if (newState.view1.length > 0 && newState.view2.length > 0) {
        setTimeout(onUploadSuccess, 500);
      }
      return newState;
    });
    return false;
  };

  const renderMiniDragger = (label: string, icon: React.ReactNode, type: 'view1' | 'view2', currentFiles: UploadFile[]) => {
    const hasFile = currentFiles.length > 0;
    const draggerClass = `${styles.customDragger} ${styles.draggerMini} ${hasFile ? styles.draggerHasFile : ''}`;

    return (
      <div className={styles.flexColumn}>
        <Text strong className={styles.mb8}>{label}</Text>
        <Dragger
          multiple={false} showUploadList={false}
          beforeUpload={(f) => handleUpload(f, type)}
          className={draggerClass}
        >
          {hasFile ? (
            <div className={styles.fadeIn}>
              <CheckCircleOutlined className={styles.successIconMedium} />
              <div className={styles.mt16} style={{ fontSize: 12 }}>{currentFiles[0].name}</div>
            </div>
          ) : (
            <>
              <p className="ant-upload-drag-icon">{icon}</p>
              <p className={`${styles.draggerTextMini}`}>{t("uploadModal.dragDrop")}</p>
            </>
          )}
        </Dragger>
      </div>
    );
  };

  const renderPreviewBox = (label: string, file: UploadFile) => (
    <div>
      <div className={styles.previewHeader}>
        <Text type="secondary" className={styles.previewLabel}>{label}</Text>
      </div>
      <div className={styles.videoWrapper}>
        <VideoPlayer
          file={file?.originFileObj as File}
          className={styles.videoContent}
        />
      </div>
      <div className={styles.previewNameMini}>
        {file?.name}
      </div>
    </div>
  );

  if (step === 'upload') {
    return (
      <div className={styles.fadeIn}>
        <div className={`${styles.textCenter} ${styles.mb24}`}>
          <Text strong style={{ fontSize: 16 }}>{t("uploadModal.multi.title")}</Text>
          <div className={styles.mt4}>
            <Text type="secondary">{t("uploadModal.multi.description")}</Text>
          </div>
        </div>
        <Row gutter={24}>
          <Col span={12}>
            {renderMiniDragger(
              'View 1',
              <CloudUploadOutlined className={styles.draggerIconMini} />,
              'view1',
              files.view1
            )}
          </Col>
          <Col span={12}>
            {renderMiniDragger(
              'View 2',
              <CloudUploadOutlined className={styles.draggerIconMini} />,
              'view2',
              files.view2
            )}
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div className={styles.fadeIn}>
      <Row gutter={24}>
        <Col span={24}>
          <Row gutter={16} className={styles.mb24}>
            <Col span={12}>{renderPreviewBox('View 1', files.view1[0])}</Col>
            <Col span={12}>{renderPreviewBox('View 2', files.view2[0])}</Col>
          </Row>
        </Col>
        <Col span={24}>
          <Text strong>{t("uploadModal.caption")}</Text>
          <TextArea
            rows={3}
            placeholder={t("uploadModal.captionPlaceholder")}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className={`${styles.captionArea} ${styles.mt16}`}
            maxLength={200}
            showCount
          />
        </Col>
      </Row>
    </div>
  );
};