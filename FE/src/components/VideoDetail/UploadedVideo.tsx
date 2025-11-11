import { useEffect, useState } from "react";

const UploadedVideo = ({ videoDetail }: { videoDetail: any }) => {
  const [videoStyle, setVideoStyle] = useState<{ width?: string, height?: string }>({ width: '100%' })
  useEffect(() => {
    if (videoDetail?.width && videoDetail?.height) {
      const { width, height } = videoDetail;
      if (width < height)
        setVideoStyle({ height: '100%' })
    }
  }, [videoDetail])

  return <div style={{ height: '100%', 'width': '100%' }}>
    <div
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 'auto', height: '100%' }}
    >
      <video
        src={videoDetail?.video_url}
        controls
        style={{
          objectFit: "contain",
          objectPosition: "center",
          backgroundColor: "#000",
          margin: 'auto',
          ...videoStyle
        }} />
    </div>
  </div>;
}

export default UploadedVideo;