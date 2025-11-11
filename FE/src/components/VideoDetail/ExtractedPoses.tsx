import { Button, message, Typography } from "antd";
import { extractPoses, getExtractedPosesById } from "../../services/videoService";
import { useEffect, useState } from "react";

const ExtractedPoses = ({ videoId, status, setStatus, videoDetail }: {
  videoId: string | undefined,
  status: string | undefined,
  setStatus: (status: string) => void,
  videoDetail: any
}
) => {
  const [videoStyle, setVideoStyle] = useState<{ width?: string, height?: string }>({ width: '100%' })
  useEffect(() => {
    if (videoDetail?.width && videoDetail?.height) {
      const { width, height } = videoDetail;
      if (width < height)
        setVideoStyle({ height: '100%' })
    }
  }, [videoDetail])
  const [loading, setLoading] = useState(false);
  const [videoPoseDetails, setVideoPoseDetails] = useState<any>(null);

  const handleExtractPoses = async () => {
    if (!videoId) return;
    try {
      setLoading(true);
      await extractPoses(Number(videoId));
      setStatus("extracting_poses");
    } catch (error) {
      console.error("Error extracting poses:", error);
      message.error("Pose extraction failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getExtractedPosesDetails = async () => {
      if (!videoId) return;
      try {
        const res = await getExtractedPosesById(videoId);
        setVideoPoseDetails(res);
      } catch (error) {
        console.error('Error fetching extracted poses details:', error);
      }
    };

    if (status && (status === "extracted_poses" || status === 'drawing_3d' || status === "drawn_3d")) {
      getExtractedPosesDetails();
    }
  }, [videoId, status]);

  return (
    <>
      {status === "uploaded" && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
          <Button type="primary" onClick={handleExtractPoses} loading={loading}>
            EXTRACT POSES
          </Button>
        </div>
      )}
      {status === "extracting_poses" && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
          <Typography.Text disabled>
            EXTRACTING POSES...
          </Typography.Text>
        </div>
      )}
      {(status === "extracted_poses" || status === "drawing_3d" || status === "drawn_3d") && (
        <div style={{ width: '100%', height: '100%', padding: '16px' }}>
          <div style={{ height: '100%', width: '100%' }}>
            <div style={{ width: '70%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', margin: 'auto' }}>
              <video
                src={videoPoseDetails?.video_url}
                controls
                style={{
                  objectFit: "contain",
                  objectPosition: "center",
                  backgroundColor: "#000",
                  margin: 'auto',
                  ...videoStyle
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExtractedPoses;
