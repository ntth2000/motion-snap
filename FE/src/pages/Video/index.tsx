import { Button, message, Steps } from 'antd';
import AppLayout from '../../layout/AppLayout';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { getExportedData, getJobStatus, getVideoById } from '../../services/videoService';
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
    setVideoStep(value);
  };
  const [videoStep, setVideoStep] = useState<number>(0);
  const [videoDetail, setVideoDetails] = useState<IVideo>();
  const [jobStatus, setJobstatus] = useState<string>("")
  const [messageApi, msgContextHolder] = message.useMessage();
  const intervalRef = useRef<number | null>(null);

  const startPolling = () => {
    if (!videoId) return;
    if (intervalRef.current) return;

    intervalRef.current = window.setInterval(async () => {
      try {
        const res = await getJobStatus(videoId);
        const currentStatus = res.status.toLowerCase()
        if (jobStatus === "extracting_poses" && currentStatus === "extracted_poses") {
          setJobstatus(currentStatus)
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
        }
        if (jobStatus === "drawing_3d" && currentStatus === "drawn_3d") {
          setJobstatus(currentStatus)
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
        }
      } catch (error) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        console.error("Error checking job status:", error);
        message.error("Pose extraction failed");
        setJobstatus(prev => {
          if (prev === "extracting_poses") return "uploaded"
          if (prev === "drawing_3d") return "extracted_poses"
          return prev
        })
      }
    }, 3000);
  };

  useEffect(() => {
    if (jobStatus === "extracting_poses" || jobStatus === "drawing_3d") {
      startPolling();
    }

    // return () => {
    //   if (intervalRef.current) clearInterval(intervalRef.current);
    // };
  }, [jobStatus, videoId]);

  const getVideoDetails = async () => {
    try {
      const res = await getVideoById(videoId as string);
      setVideoDetails(res);
      const status = res.status.toLowerCase()
      setJobstatus(status)
      if (status === "extracted_poses" || status === "drawing_3d" || status === "drawn_3d") {
        setVideoSteps([
          { title: 'Uploaded' },
          { title: 'Extract Poses', },
          { title: 'Draw 3D' },
        ]);
      } else {
        setVideoSteps([
          { title: 'Uploaded' },
          { title: 'Extract Poses', },
          { title: 'Draw 3D', disabled: true },
        ]);
      }
    } catch (error) {
      console.error('Error fetching video details:', error);
      messageApi.open({
        content: "There is an error fetching video details. Please try again",
        type: "error"
      })
    }
  };

  useEffect(() => {
    if (jobStatus === "extracted_poses" || jobStatus === "drawing_3d" || jobStatus === "drawn_3d") {
      setVideoSteps([
        { title: 'Uploaded' },
        { title: 'Extract Poses', },
        { title: 'Draw 3D' },
      ]);
    } else {
      setVideoSteps([
        { title: 'Uploaded' },
        { title: 'Extract Poses', },
        { title: 'Draw 3D', disabled: true },
      ]);
    }
  }, [jobStatus])

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
      {msgContextHolder}
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
            <ExtractedPoses videoId={videoId} status={jobStatus || "uploaded"} setStatus={setJobstatus} />
          )}

          {videoStep === 2 && (
            <Draw3D videoId={videoId} status={jobStatus || "uploaded"} setStatus={setJobstatus} />
          )}
        </div>

        {videoStep !== 0 &&
          <div style={{ marginLeft: 'auto' }}>
            <Button
              variant="solid"
              color="default"
              onClick={handleExport}
              disabled={(jobStatus === "extracting_poses" && videoStep === 1) || (jobStatus === 'drawing_3d' && videoStep == 2)}
            >
              Export
            </Button>
          </div>
        }
      </div>
    </AppLayout>
  );
}
