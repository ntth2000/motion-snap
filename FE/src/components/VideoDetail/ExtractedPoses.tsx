import { Button } from "antd";
import { extractPoses, getExtractedPosesById } from "../../services/videoService";
import { useEffect, useState } from "react";

const ExtractedPoses = ({ videoId, status }: { videoId: string | undefined, status: string | undefined }) => {
  const [loading, setLoading] = useState(false);
  const [videoPoseDetails, setVideoPoseDetails] = useState<any>(null);

  const handleExtractPoses = async () => {
    try {
      setLoading(true);
      await extractPoses(Number(videoId));
    } catch (error) {
      console.error("Error extracting poses:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const getExtractedPosesDetails = async () => {
      try {
        const res = await getExtractedPosesById(videoId as string);
        setVideoPoseDetails(res);
      } catch (error) {
        console.error('Error fetching extracted poses details:', error);
      }
    }
    status !== "UPLOADED" && getExtractedPosesDetails();
  }, [videoId]);

  return <>
    {(status === "UPLOADED") ? (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
        <Button color="default" variant="solid" onClick={handleExtractPoses} loading={loading}>EXTRACT POSES</Button>
      </div>
    ) : (
      <div style={{ width: '100%', height: '100%', padding: '16px' }}>
        <div style={{ height: '100%', width: '100%' }}>
          <div className="" style={{ width: '70%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', margin: 'auto' }}>
            <video src={videoPoseDetails?.video_url}
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
    )}
  </>;
};

export default ExtractedPoses;