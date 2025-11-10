import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Upload,
  Typography,
  Button,
  Progress,
  message,
  Card,
  Row,
  Col,
  Modal,
} from "antd";
import { useEffect, useState } from "react";
import { uploadVideo } from "../../services/videoService";
import { eventEmitter } from "../../utils/eventEmitter";

const { Text, Title } = Typography;
const { Dragger } = Upload;


const UploadVideo: React.FC = () => {
  const [messageApi, msgContextHolder] = message.useMessage();
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadStep, setUploadStep] = useState<"upload" | "preview">("upload");

  const reset = () => {
    setUploadStep("upload");
    setFiles([]);
    setProgress({});
    setIsModalOpen(false);
  };

  const handleBeforeUpload = (file: File) => {
    setFiles((prev) => [...prev, file]);
    return false;
  };

  const props = {
    name: "file",
    multiple: true,
    accept: "video/mp4",
    beforeUpload: handleBeforeUpload,
    showUploadList: {
      showRemoveIcon: false,
      showPreviewIcon: true,
    }
  };

  const removeVideo = (idx: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== idx));
    if (files.length === 1) {
      setUploadStep("upload");
    }
  };

  const handleContinue = () => {
    setUploadStep("preview");
  };

  const handleUploadVideo = async () => {
    setLoading(true);
    try {
      await Promise.all(
        files.map(async (file) => {
          await uploadVideo(file, (event) => {
            if (event.total) {
              const percent = Math.round((event.loaded * 100) / event.total);
              setProgress((prev) => ({
                ...prev,
                [file.name]: percent,
              }));
            }
          });
        })
      );

      messageApi.open({
        type: "success",
        content: "All videos uploaded successfully!",
      });
      reset();
      eventEmitter.emit("reload-video-list")
    } catch (err) {
      console.error(err);
      messageApi.open({
        type: "error",
        content: "An error occurred during upload. Please try again.",
      })
    } finally {
      setLoading(false);
    }
  };


  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    reset();
  };

  useEffect(() => {
    eventEmitter.on("open-upload-video-modal", showModal);

    return () => {
      eventEmitter.off("open-upload-video-modal", showModal);
    };
  }, [])

  return (
    <Modal
      destroyOnHidden
      centered
      title={uploadStep === "upload" ? "Upload videos" : "Preview"}
      closable={{ 'aria-label': 'Custom Close Button' }}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={
        uploadStep === "preview" ? (
          <>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button
              color="default"
              variant="solid"
              onClick={handleUploadVideo}
              loading={loading}
            >
              Upload
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleCancel}>Close</Button>
            {files.length > 0 && <Button
              color="default"
              variant="solid"
              onClick={handleContinue}
            >
              Next
            </Button>
            }
          </>
        )
      }
      width="70%"
      styles={{
        body: {
          height: "70vh",
          maxHeight: 820,
          overflowY: "auto",
        }
      }}
    >
      <div style={{ padding: "0 16px" }}>
        {msgContextHolder}
        {uploadStep === "upload" && (
          <div>
            <Dragger {...props}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "48px 0",
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    borderRadius: "100%",
                    backgroundColor: "#eee",
                    display: "flex",
                    justifyContent: "center",
                    padding: "16px",
                    marginBottom: "12px",
                  }}
                >
                  <UploadOutlined />
                </div>
                <Title level={5}>Select videos</Title>
                <Text type="secondary">Or drag & drop to upload</Text>
                <Text
                  type="secondary"
                  style={{ fontSize: 16, marginTop: "60px" }}
                >
                  Only support MP4 files. Max file size 30MB.
                </Text>
              </div>
            </Dragger>
          </div>
        )}

        {uploadStep === "preview" && files.length > 0 && (

          <div>
            {files.map((file, idx) => (
              <Card
                key={file.name}
                style={{
                  marginBottom: 24,
                  borderRadius: 8,
                  backgroundColor: "#fafafa",
                }}
              >
                <Row gutter={24}>
                  <Col span={6}>
                    <div style={{ width: '100%', aspectRatio: 1.5, position: 'relative', overflow: 'hidden', background: "#000", borderRadius: 8 }}>
                      <video
                        src={URL.createObjectURL(file)}
                        controls
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center",
                          backgroundColor: "#000",
                        }}
                      /></div>

                  </Col>
                  <Col span={18}>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                      <div style={{ marginRight: 16 }}>
                        <Text strong>{file.name}</Text>
                        <br />
                        {progress[file.name] ? (
                          <Progress
                            percent={progress[file.name]}
                            status={
                              progress[file.name] === 100 ? "success" : "active"
                            }
                            style={{ marginTop: 8, maxWidth: 300, width: '100%' }}
                          />
                        ) : (
                          <Text style={{ fontSize: 14 }} type="secondary">Ready to upload</Text>
                        )}
                      </div>
                      <div className="">
                        <Button onClick={() => removeVideo(idx)} style={{ padding: 10, background: 'none', border: 'none', boxShadow: 'none' }} >
                          <DeleteOutlined />
                        </Button>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            ))}
          </div>
        )
        }
      </div >
    </Modal>
  );
};

export default UploadVideo;
