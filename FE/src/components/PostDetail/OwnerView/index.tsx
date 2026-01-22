import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  EyeOutlined,
  GatewayOutlined, // For "Extract Pose"
  UsergroupAddOutlined} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  message,
  Typography} from 'antd';
import React, { useEffect, useMemo,useRef, useState } from 'react';

import { STAGE, STATUS } from '../../../constants';
import { draw3D, extractPoses, getDrawn3DById,getExtractedPosesById, getJobStatus, getPostById } from '../../../services/postService';
import type { IPost } from '../../../types';
import MultiView from './MultiView';
import SingleView from './SingleView';

const { Text } = Typography;

interface OwnerViewProps {
  post: IPost;
}


const OwnerView: React.FC<OwnerViewProps> = ({ post }) => {
  const [viewMode, setViewMode] = useState<string>('single');
  const [postDetail, setPostDetail] = useState<IPost>(post);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [loadingAction, setLoadingAction] = useState<boolean>(false);
  const [jobStatus, setJobStatus] = useState<{ status: string, stage: string }>({
    status: post.status || STATUS.COMPLETED,
    stage: post.currentStage || STAGE.UPLOADING
  });
  const [videoUrl, setVideoUrl] = useState<string | undefined>(post?.videos?.[0].fileUrl); // URL for SingleView to display

  const intervalRef = useRef<number | null>(null);
  const [messageApi, msgContextHolder] = message.useMessage();

  const stepsItems = useMemo(() => [
    {
      title: 'Preview',
      icon: <EyeOutlined />,
      status: 'finish'
    },
    {
      title: 'Extract Pose',
      icon: <GatewayOutlined />,
      status: jobStatus.stage === STAGE.DRAWING_3D || (jobStatus.stage === STAGE.EXTRACTING_POSES && jobStatus.status === STATUS.COMPLETED) ? 'finish' : 'wait'
    },
    {
      title: 'Draw Mesh',
      icon: <UsergroupAddOutlined />,
      status: jobStatus.stage === STAGE.DRAWING_3D && jobStatus.status === STATUS.COMPLETED ? 'finish' : 'wait'
    },
  ], [jobStatus]);


  const startPolling = () => {
    if (!post.id) return;
    if (intervalRef.current) return;

    intervalRef.current = window.setInterval(async () => {
      try {
        const res = await getJobStatus(post.id);
        if (jobStatus.stage === STAGE.EXTRACTING_POSES || jobStatus.stage === STAGE.DRAWING_3D) {
          setJobStatus({
            status: res.status,
            stage: jobStatus.stage
          });
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
        }
      } catch (error) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        console.error("Error checking job status:", error);
        message.error("Pose extraction failed");
        setJobStatus(prev => {
          if (prev.stage === STAGE.EXTRACTING_POSES) return { stage: STAGE.UPLOADING, status: STATUS.COMPLETED }
          if (prev.stage === STAGE.DRAWING_3D) return { stage: STAGE.EXTRACTING_POSES, status: STATUS.COMPLETED }
          return prev
        })
      }
    }, 3000);
  };

  // Initial fetch and setup
  useEffect(() => {
    const getPostDetail = async () => {
      try {
        const res = await getPostById(post.id);
        console.log(res);
        setPostDetail(res);
        setJobStatus({ status: res.status, stage: res.currentStage });
        if (res.viewMode) {
          setViewMode(res.viewMode);
        }
      } catch (error) {
        console.error("Error fetching post detail:", error);
      }
    }
    getPostDetail();
  }, [post.id]);

  // Update step based on jobStatus
  useEffect(() => {
    const status = jobStatus?.stage?.toLowerCase();
    if (status === STAGE.UPLOADING || status === STAGE.EXTRACTING_FRAMES) {
      setCurrentStep(0);
    } else if (status === STAGE.EXTRACTING_POSES || status === STAGE.DRAWING_3D) {
      setCurrentStep(1);
    }
  }, [jobStatus]);

  useEffect(() => {
    const fetchSpecificVideo = async () => {
      if (!postDetail.videos || postDetail.videos.length === 0) return;
      if (currentStep === 0) {
        try {
          const res = await getPostById(post.id);
          setPostDetail(res);
        } catch (e) { console.error(e); }
      } else if (
        currentStep === 1 &&
        ((jobStatus.stage === STAGE.EXTRACTING_POSES && jobStatus.status === STATUS.COMPLETED) || jobStatus.stage === STAGE.DRAWING_3D)
      ) {
        try {
          const res = await getExtractedPosesById(postDetail.id);
          setPostDetail(res);
        } catch (e) { console.error(e); }
      } else if (currentStep >= 2 && jobStatus.stage === STAGE.DRAWING_3D) {
        try {
          const videoId = postDetail.videos[0].id.toString();
          const res = await getDrawn3DById(videoId);
          setPostDetail(res);
        } catch (e) { console.error(e); }
      }
    }
    fetchSpecificVideo();
  }, [currentStep]);

  useEffect(() => {
    const status = jobStatus?.stage?.toUpperCase();
    if (status === STAGE.EXTRACTING_POSES || status === STAGE.DRAWING_3D) {
      startPolling();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [jobStatus, postDetail.videos]);


  // Actions
  const handleExtractPoses = async () => {
    if (!postDetail.id) return;
    if ((jobStatus.stage === STAGE.EXTRACTING_POSES && jobStatus.status === STATUS.COMPLETED) || jobStatus.stage === STAGE.DRAWING_3D) {
      setCurrentStep(1);
      return;
    }
    try {
      setLoadingAction(true);
      await extractPoses(postDetail.id);
      setJobStatus({ stage: STAGE.EXTRACTING_POSES, status: STATUS.PENDING }); // Trigger polling
    } catch (error) {
      console.error(error);
      messageApi.error("Failed to start pose extraction.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDrawMesh = async () => {
    if (!postDetail.id) return;
    try {
      setLoadingAction(true);
      await draw3D(postDetail.id);
      setJobStatus({ stage: STAGE.DRAWING_3D, status: STATUS.PENDING }); // Trigger polling
      // Note: In VideoDetail, separate API for draw3D.
    } catch (error) {
      console.error(error);
      messageApi.error("Failed to start 3D drawing.");
    } finally {
      setLoadingAction(false);
    }
  }

  const onChangeStep = (value: number) => {
    setCurrentStep(value);
  };

  return (
    <div className="pb-6 flex flex-col gap-6">
      {msgContextHolder}
      <div className="">
        <div className="flex items-start justify-between relative">
          {
            stepsItems.map((item, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center z-10 flex-1" onClick={() => onChangeStep(index)}>
                  <div className={`size-8 rounded-full flex items-center justify-center font-bold mb-1 shadow-lg ${currentStep === index ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {item.icon}
                  </div>
                  <span className={`text-xs ${currentStep === index ? 'text-[#0d121b] dark:text-white' : 'text-gray-500'}`}>{item.title}</span>
                </div>
                {
                  index < stepsItems.length - 1 && (
                    <div className="absolute top-4 left-[16%] right-[16%] h-[2px] bg-[#cfd7e7] dark:bg-gray-700 -z-0">
                    </div>
                  )
                }
              </React.Fragment>
            ))
          }
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="col-span-8 lg:col-span-9 flex flex-col gap-6">
          {viewMode === 'single' ? (
            // Passing videoUrl if we have a specific result to show
            <SingleView post={postDetail} />
          ) : (
            <MultiView post={postDetail} />
          )}
        </div>

        <div className="col-span-4 lg:col-span-3 flex flex-col gap-6">
          <div className="flex flex-row gap-4">
            {currentStep !== 0 && <Button
              type="primary"
              block
              onClick={() => onChangeStep(currentStep - 1)}
            >
              <ArrowLeftOutlined />Back Step
            </Button>
            }
            {currentStep !== 2 && <Button
              type="primary"
              block
              onClick={() => onChangeStep(currentStep + 1)}
            >
              Next Step <ArrowRightOutlined />
            </Button>
            }
          </div>


          {currentStep === 0 && (
            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-6 shadow-sm">
              <Text className="text-gray-500 mb-4 block leading-relaxed text-sm">
                Ready to extract poses? This process typically takes time depending on video complexity.
              </Text>
              <Button
                type="primary"
                size="large"
                block
                className="h-12 text-base font-bold shadow-lg shadow-primary/30"
                onClick={handleExtractPoses}
                loading={loadingAction || (jobStatus.stage === STAGE.EXTRACTING_POSES && jobStatus.status !== STATUS.COMPLETED)}
              >
                {jobStatus.stage === STAGE.EXTRACTING_POSES && jobStatus.status === STATUS.PROCESSING ? 'Extracting...' : 'Extract Poses'}
              </Button>
              <div className="text-[10px] text-center mt-4 text-gray-400 uppercase tracking-widest font-bold">
                AI Powered Extraction
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 rounded-xl p-6 shadow-sm">
              <Text className="text-gray-500 mb-4 block leading-relaxed text-sm">
                Poses extracted! You can now generate the 3D mesh.
              </Text>
              <Button
                type="primary" // ghost or default maybe?
                block
                size="large"
                className="h-12 text-base font-bold bg-blue-600 hover:bg-green-500 border-none"
                onClick={handleDrawMesh}
                loading={loadingAction || jobStatus.stage === STAGE.DRAWING_3D}
                disabled={jobStatus.stage === STAGE.DRAWING_3D}
              >
                {jobStatus.stage === STAGE.DRAWING_3D ? 'Drawing...' : 'Draw 3D Mesh'}
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 rounded-xl p-6 shadow-sm">
              <Alert message="Process Completed" description="3D Mesh generation is complete." type="success" showIcon />
              <Button type="default" block className="mt-4">Download Assets</Button>
            </div>
          )}


          <Card className="border-gray-200 dark:border-gray-800" title="File Properties">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <Text type="secondary">Resolution</Text>
                <Text strong>1920 x 1080 (1080p)</Text>
              </div>
              <div className="flex justify-between items-center text-sm">
                <Text type="secondary">Frame Rate</Text>
                <Text strong>60 fps</Text>
              </div>
              <div className="flex justify-between items-center text-sm">
                <Text type="secondary">File Size</Text>
                <Text strong>42.8 MB</Text>
              </div>
              <div className="flex justify-between items-center text-sm">
                <Text type="secondary">Duration</Text>
                <Text strong>00:02:23</Text>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OwnerView;
