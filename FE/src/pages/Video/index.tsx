import { Button, Steps } from 'antd';
import AppLayout from '../../layout/AppLayout';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getExportedData, getVideoById } from '../../services/videoService';
import ExtractedFrames from '../../components/VideoDetail/UploadedVideo';
import ExtractedPoses from '../../components/VideoDetail/ExtractedPoses';
import type { IVideo } from '../../types';
import Draw3D from '../../components/VideoDetail/Draw3d';

export default function VideoPage() {
  const { videoId } = useParams();
  const [videoSteps, setVideoSteps] = useState<{ title: string, disabled?: boolean }[]>([
    {
      title: 'Uploaded',
    },
    {
      title: 'Extract Poses',
    },
    {
      title: 'Draw 3D',
    },
  ]);
  const onChangeStep = (value: number) => {
    console.log('onChange:', value);
    setVideoStep(value);
  };
  const [videoStep, setVideoStep] = useState<number>(0);
  const [videoDetail, setVideoDetails] = useState<IVideo>();

  const getVideoDetails = async () => {
    try {
      const res = await getVideoById(videoId as string);
      setVideoDetails(res);
      const status = res.status.toLowerCase()
      if (status === 'uploaded') {
        setVideoSteps([
          { title: 'Uploaded' },
          { title: 'Extract Poses', },
          { title: 'Draw 3D', disabled: true },
        ]);
      } else {
        setVideoSteps([
          { title: 'Uploaded' },
          { title: 'Extract Poses' },
          { title: 'Draw 3D' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching video details:', error);
    }
  };

  useEffect(() => {
    videoId && getVideoDetails();
  }, [])

  const handleExport = async () => {
    const type = videoStep === 1 ? "extracted_poses" : '3d'
    try {
      const response = await getExportedData(videoId as string, type);
      const url = window.URL.createObjectURL(response.data);

      // Tạo link và trigger download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `video_${videoId}_${type}_export.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  }

  return (
    <AppLayout>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '0 16px 16px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        overflowY: 'hidden',
      }}>
        <div className="">
          <Steps
            type="navigation"
            size="small"
            current={videoStep}
            onChange={onChangeStep}
            items={videoSteps}
            style={{ borderBottom: '2px solid #f0f0f0' }}
          />
        </div>

        <div style={{ padding: "0 16px", flexGrow: 1 }}>
          {videoStep === 0 && (
            <ExtractedFrames videoDetail={videoDetail} />
          )}
          {videoStep === 1 && (
            <ExtractedPoses videoId={videoId} status={videoDetail?.status} />
          )}

          {videoStep === 2 && (
            <Draw3D videoId={videoId} status={videoDetail?.status} />
          )}
        </div>

        {videoStep !== 0 &&
          <div style={{ marginLeft: 'auto' }}>
            <Button variant="solid" color="default" onClick={handleExport}>Export</Button>
          </div>
        }
      </div>
    </AppLayout>
  );
}
