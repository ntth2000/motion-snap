import { Button, message, Typography } from "antd";
import { useEffect, useState } from "react";
import { draw3D, getDrawn3DById } from "../../services/videoService";

const Draw3D = ({ videoId, status, setStatus }: {
  videoId: string | undefined,
  status: string | undefined,
  setStatus: (status: string) => void
}) => {
  const [loading, setLoading] = useState(false);
  const [videoDetails, setVideoDetails] = useState<any>(null);
  const [messageApi, msgContextHolder] = message.useMessage();

  const handleDraw3D = async () => {
    if (!videoId) return;
    try {
      setLoading(true);
      await draw3D(Number(videoId));
      setStatus("drawing_3d")
    } catch (error) {
      messageApi.open({
        content: "Pose extraction failed",
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const getDrawn3DFrames = async () => {
      if (!videoId) return;
      try {
        const res = await getDrawn3DById(videoId);
        setVideoDetails(res);
      } catch (error) {
        console.error('Error fetching extracted poses details:', error);
      }
    };

    if (status && status === "drawn_3d") {
      getDrawn3DFrames();
    }
  }, [videoId, status]);

  return <>
    {msgContextHolder}
    {
      (status === "extracted_poses") &&
      (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
          <Button color="default" variant="solid" onClick={handleDraw3D} loading={loading}>DRAW 3D</Button>
        </div>
      )
    }
    {
      (status === "drawing_3d") && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
          <Typography.Text disabled>
            DRAWING 3D...
          </Typography.Text>
        </div>
      )
    }
    {(status === "drawn_3d") && (
      <div style={{ width: '100%', height: '100%', padding: '16px' }}>
        <div style={{ height: '100%', width: '100%' }}>
          <div className="" style={{ width: '70%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 'auto', height: '100%' }}>
            <video src={videoDetails?.video_url}
              controls
              style={{
                width: "100%",
                objectFit: "contain",
                objectPosition: "center",
                backgroundColor: "#000",
                margin: 'auto'
              }} />
          </div>
        </div>
      </div >
    )
    }
  </>;
};

export default Draw3D;