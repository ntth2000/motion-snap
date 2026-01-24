import { CheckCircleFilled, CloudUploadOutlined, VideoCameraOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { Button, message, Modal, Progress, Tabs, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createPostApi } from "../../services/postService";
import { eventEmitter } from "../../utils/eventEmitter";
import styles from './CreatePostModal.module.css';
import { MultiView } from './Multiview';
import { SingleView } from './Singleview';
const { Text, Title } = Typography;

type ViewMode = 'single' | 'multi';
type UploadStep = 'upload' | 'preview';

interface CreatePostModalProps {

}

interface PostData {
  viewMode: 'single' | 'multi';
  caption: string;
  files: any;
}

export default function CreatePostModal({ }: CreatePostModalProps) {
  const { t } = useTranslation();
  const [messageApi, msgContextHolder] = message.useMessage();
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [step, setStep] = useState<UploadStep>('upload');
  const [caption, setCaption] = useState('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [singleFiles, setSingleFiles] = useState<UploadFile[]>([]);
  const [multiFiles, setMultiFiles] = useState<{ view1: UploadFile[], view2: UploadFile[] }>({
    view1: [], view2: []
  });

  const resetState = () => {
    setStep('upload');
    setCaption('');
    setSingleFiles([]);
    setMultiFiles({ view1: [], view2: [] });
  };

  const handleTabChange = (key: string) => {
    setViewMode(key as ViewMode);
    resetState();
  };

  const handlePost = async () => {
    const formData = new FormData();
    formData.append('caption', caption || '');
    formData.append('view_mode', viewMode);

    if (viewMode === 'single') {
      const file = singleFiles?.[0]?.originFileObj;
      if (file) {
        formData.append('video_main', file);
      }
    } else {
      const file1 = multiFiles?.view1?.[0]?.originFileObj;
      const file2 = multiFiles?.view2?.[0]?.originFileObj;

      if (file1) formData.append('video_view1', file1);
      if (file2) formData.append('video_view2', file2);
    }

    try {
      setIsUploading(true);
      await createPostApi(formData, (progressEvent: any) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });
      messageApi.open({
        type: "success",
        content: t("uploadModal.message.uploadSuccess")
      });
      resetState();
    } catch (err) {
      console.error(err);
      messageApi.open({
        type: "error",
        content: t("uploadModal.message.uploadFailed"),
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }

    eventEmitter.emit("reload-post-list");

    setTimeout(() => {
    }, 500);
  }

  const showModal = () => {
    setIsModalOpen(true);
  };

  const onCancel = () => {
    resetState();
    setIsModalOpen(false);
  };

  useEffect(() => {
    eventEmitter.on("open-upload-video-modal", showModal);

    return () => {
      eventEmitter.off("open-upload-video-modal", showModal);
    };
  }, [])

  const modalFooter = (
    <div className={styles.modalFooter}>
      <Button onClick={step === 'preview' ? resetState : onCancel}>
        {step === 'preview' ? t('common.back') : t('common.cancel')}
      </Button>
      <Button
        type={step !== 'upload' ? "primary" : "default"}
        disabled={step === 'upload'}
        onClick={handlePost}
      >
        {t("uploadModal.uploadBtn")}
      </Button>
    </div>
  );

  return (
    <Modal
      open={isModalOpen}
      onCancel={onCancel}
      title={<Title level={5} style={{ margin: 0 }}>MotionSnap</Title>}
      footer={modalFooter}
      width={1200}
      centered
      maskClosable={false}
      styles={{ body: { padding: '24px 24px 0 24px', overflowY: 'scroll' } }}
    >
      {msgContextHolder}
      {isUploading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/75 backdrop-blur-md transition-all duration-300 px-4">
          {/* Tăng width hộp chứa lên một chút (ví dụ w-[400px]) để thanh ngang nhìn thoáng hơn */}
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-8 w-full max-w-[400px]">

            <div className="flex flex-col items-center gap-2 text-center">
              <h3 className="text-xl font-bold text-slate-800 m-0">{t("uploadModal.progress.title")}</h3>
              <p className="text-slate-500 text-sm m-0">{t("uploadModal.progress.description")}</p>
            </div>

            <div className="w-full px-2">
              <Progress
                percent={uploadProgress}
                strokeColor={{
                  '0%': '#3b82f6',
                  '100%': '#22c55e',
                }}
                strokeWidth={16}
                status="active"
                strokeLinecap="round"
                format={(percent) => (
                  <span className="text-slate-700 font-bold ml-2">{percent}%</span>
                )}
              />
            </div>

            {uploadProgress < 100 ? (
              <div className="text-slate-400 text-xs animate-pulse">
                {t("uploadModal.progress.processing")}
              </div>
            ) : (
              <div className="text-green-600 text-sm font-medium flex items-center gap-2">
                <CheckCircleFilled /> {t("uploadModal.progress.finish")}
              </div>
            )}

          </div>
        </div>
      )}
      <Tabs
        activeKey={viewMode}
        onChange={handleTabChange}
        items={[
          { key: 'single', label: t("uploadModal.viewMode.single"), icon: <VideoCameraOutlined /> },
          { key: 'multi', label: t("uploadModal.viewMode.multi"), icon: <CloudUploadOutlined /> },
        ]}
        className={styles.mb24}
      />

      <div className="min-h-[320px]">
        {viewMode === 'single' ? (
          <SingleView
            step={step}
            files={singleFiles}
            setFiles={setSingleFiles}
            caption={caption}
            setCaption={setCaption}
            onUploadSuccess={() => setStep('preview')}
          />
        ) : (
          <MultiView
            step={step}
            files={multiFiles}
            setFiles={setMultiFiles}
            caption={caption}
            setCaption={setCaption}
            onUploadSuccess={() => setStep('preview')}
          />
        )}
      </div>
    </Modal>
  );
}