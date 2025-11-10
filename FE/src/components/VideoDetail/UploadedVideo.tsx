const UploadedVideo = ({ videoDetail }: { videoDetail: any }) => {
  return <div style={{ height: '100%', 'width': '100%' }}>
    <div
      style={{ width: '70%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 'auto', height: '100%' }}
    >
      <video
        src={videoDetail?.video_url}
        controls
        style={{
          width: "100%",
          objectFit: "contain",
          objectPosition: "center",
          backgroundColor: "#000",
          margin: 'auto'
        }} />
    </div>
  </div>;
}

export default UploadedVideo;