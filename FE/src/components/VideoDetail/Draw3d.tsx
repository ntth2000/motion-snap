import { Button } from "antd";
import { useEffect, useState } from "react";
import { draw3D, getDrawn3DById } from "../../services/videoService";

const Draw3D = ({ videoId, status }: { videoId: string | undefined, status: string | undefined }) => {
  const [loading, setLoading] = useState(false);
  const [videoDetails, setVideoDetails] = useState<any>(null);


  const handleDraw3D = async () => {
    try {
      setLoading(true);
      await draw3D(Number(videoId));
    } catch (error) {
      console.error("Error drawing 3D:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const getDrawn3DFrames = async () => {
      try {
        const res = await getDrawn3DById(videoId as string);
        setVideoDetails(res)
      } catch (error) {
        console.error('Error fetching extracted frames:', error);
      }
    }
    videoId && status === "DRAWN_3D" && getDrawn3DFrames();
  }, [])

  return <>
    {
      status === "EXTRACTED_POSES" ?
        (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
            <Button color="default" variant="solid" onClick={handleDraw3D} loading={loading}>EXTRACT POSES</Button>
          </div>
        ) : (
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