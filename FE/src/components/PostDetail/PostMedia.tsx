import { Button, message } from "antd"
import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { STAGE, STATUS } from "../../constants"
import { draw3D, extractPoses, getDrawn3DById, getExtractedPosesById, getJobStatus } from "../../services/videoService"
import type { IVideo } from "../../types"
import Progress from "../UI/Progress"
import { SegmentedControl } from "../UI/SegmentedControl"
import { getAssetUrl } from "../../services"

interface PostMediaProps {
  video: IVideo,
  isOwner: boolean
}

const VIEWS = [{
  key: 'originalVideo',
}, {
  key: 'extractedPoses',
}, {
  key: 'draw3d'
}];

export default function PostMedia({ video, isOwner }: PostMediaProps) {
  const [messageApi, msgContextHolder] = message.useMessage();
  const [viewMode, setViewMode] = useState<'originalVideo' | 'extractedPoses' | 'draw3d'>('originalVideo');
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false)
  const intervalRef = useRef<number | null>(null);
  const [jobStatus, setJobStatus] = useState<{ status: string, stage: string }>({
    status: video.status,
    stage: video.stage
  })
  const [videoDetails, setVideoDetails] = useState<({ id: number, files: { originalVideo: string, extractedPoses: string | null, draw3d: string | null } })>({
    id: video.id,
    files: {
      originalVideo: video.fileUrl,
      extractedPoses: null,
      draw3d: null
    }
  })
  const viewOptions = useMemo(() => {
    return VIEWS.map((item) => ({
      label: t(`pages.post.viewOptions.${item.key}`),
      value: item.key,
    }));
  }, []);
  console.log("video", video)
  console.log("jobStatus", jobStatus)
  console.log("videoDetails", videoDetails)

  const startPolling = (videoId: number) => {
    console.log("startPolling videoId=", videoId)
    if (intervalRef.current) return;

    intervalRef.current = window.setInterval(async () => {
      try {
        const res = await getJobStatus(videoId);
        if (res.status === STATUS.COMPLETED) {
          console.log("res.status === STATUS.COMPLETED")
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setLoading(false)
          setJobStatus({
            status: res.status,
            stage: jobStatus.stage
          })
          fetchVideoDetails()
        }
        if (res.status === STATUS.FAILED) {
          setJobStatus({
            status: res.status,
            stage: jobStatus.stage
          });
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setLoading(false)
          messageApi.open({
            type: 'error',
            content: 'Failed to process video. Please try again.',
          });
          fetchVideoDetails()
        }
      } catch (error) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        message.error("Pose extraction failed");
        setJobStatus(prev => {
          if (prev.stage === STAGE.EXTRACTING_POSES) return { stage: STAGE.UPLOADING, status: STATUS.COMPLETED }
          if (prev.stage === STAGE.DRAWING_3D) return { stage: STAGE.EXTRACTING_POSES, status: STATUS.COMPLETED }
          return prev
        })
      }
    }, 3000);
  };

  const handleExtractPoses = async (videoId: number) => {
    try {
      setLoading(true);
      await extractPoses(videoId);
      const res = await getJobStatus(videoId);
      setJobStatus({
        status: res.status,
        stage: res.stage
      })
      startPolling(videoId);
    } catch (error) {
      console.error(error);
      messageApi.open({
        type: 'error',
        content: t('pages.post.message.extract_error'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDraw3d = async (videoId: number) => {
    try {
      setLoading(true);
      await draw3D(videoId);
      const res = await getJobStatus(videoId);
      setJobStatus({
        status: res.status,
        stage: res.stage
      })
      startPolling(videoId);
    } catch (error) {
      console.error(error);
      messageApi.open({
        type: 'error',
        content: t('pages.post.message.draw_3d_error'),
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVideoDetails = async () => {
    try {
      const [posesRes, draw3dRes] = await Promise.all([
        getExtractedPosesById(video.id),
        getDrawn3DById(video.id),
      ]);

      setVideoDetails(prev => ({
        ...prev,
        files: {
          ...prev.files,
          extractedPoses: posesRes?.videoUrl ?? null,
          draw3d: draw3dRes?.videoUrl ?? null,
        },
      }));
    } catch (err) {
      console.error("Failed to fetch video details", err);
    }
  };

  useEffect(() => {
    if (!video?.id) return;

    fetchVideoDetails();

    if (jobStatus?.status === STATUS.PROCESSING) {
      startPolling(video.id);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [video?.id]);

  return <>
    {msgContextHolder}
    {jobStatus?.status === STATUS.PROCESSING && isOwner &&
      <Progress
        description={"Please wait for the process to complete."}
        title={jobStatus.stage === STAGE.EXTRACTING_POSES ? "Extracting poses" : "Drawing 3D"}
      />
    }
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="group relative flex aspect-video items-center justify-center bg-black mb-4 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-90"
        >
          {videoDetails.files[viewMode] ? (
            <video
              src={getAssetUrl(videoDetails.files[viewMode])}
              className="w-full h-full object-contain"
              controls
            />
          ) : (
            viewMode === 'extractedPoses' ?
              <div className="flex flex-col h-full w-full items-center justify-center bg-gray-50">
                <p className="text-center">Poses haven't been extracted yet.</p>
                {isOwner && <div className="flex justify-center mt-4">
                  <Button
                    type="primary"
                    loading={loading}
                    className="h-12 text-base font-bold shadow-lg shadow-primary/30 uppercase"
                    onClick={() => handleExtractPoses(videoDetails.id)}
                  >
                    Extract Poses
                  </Button>
                </div>}
              </div> :
              <div className="flex flex-col h-full w-full items-center justify-center bg-gray-50">
                <p className="text-center">3D hasn't been drawn yet.</p>
                {isOwner && <div className="flex justify-center mt-4">
                  <Button
                    type="primary"
                    loading={loading}
                    className="h-12 text-base font-bold shadow-lg shadow-primary/30 uppercase"
                    onClick={() => handleDraw3d(videoDetails.id)}
                  >
                    Draw 3D
                  </Button>
                </div>}
              </div>
          )}
        </div>
      </div >
      {
        viewOptions.length > 1 && <div className="border-b border-slate-50 pb-4">
          <div className="rounded-xl bg-slate-50 p-1">
            <SegmentedControl
              options={viewOptions}
              value={viewMode}
              onChange={(val) => setViewMode(val as 'originalVideo' | 'extractedPoses' | 'draw3d')}
            />
          </div>
        </div>
      }
    </div>
  </>
}