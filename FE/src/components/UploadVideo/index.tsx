import { UploadOutlined } from "@ant-design/icons";
import {
  Upload,
  Typography,
  type UploadProps,
  Input,
  Form,
  Row,
  Col,
  Button,
  Progress,
  message,
} from "antd";
import { useState } from "react";
import { uploadVideo } from "../../services/videoService";

const { Text, Title } = Typography;
const { Dragger } = Upload;

type UploadVideoProps = {
  onChangeSteps: (value: number) => void;
};

const UploadVideo: React.FC<UploadVideoProps> = ({ onChangeSteps }) => {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<"upload" | "form">("upload");
  const [disabled, setDisabled] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const handleBeforeUpload = (file: File) => {
    setFile(file);
    setDisabled(true);
    setStep("form");
    onChangeSteps(1);
    return false; // Ngăn antd upload tự động
  };

  const props: UploadProps = {
    name: "file",
    multiple: false,
    accept: "video/mp4",
    beforeUpload: handleBeforeUpload,
    showUploadList: false,
    disabled,
  };

  const handleBack = () => {
    setFile(null);
    setDisabled(false);
    setStep("upload");
    setProgress(0);
  };

  const handleSubmit = async (values: any) => {
    if (!file) return;
    setLoading(true);
    setProgress(0);

    try {
      await uploadVideo(file, values.title, values.description, (event) => {
        if (event.total) {
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress(percent);
        }
      });

      message.success("🎉 Upload video thành công!");
      setFile(null);
      setStep("upload");
      setDisabled(false);
      onChangeSteps(0);
    } catch (err) {
      console.error(err);
      message.error("Upload thất bại, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "0 16px" }}>
      {step === "upload" && (
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
            <Title level={5}>Select a video</Title>
            <Text type="secondary">Or drag & drop to upload</Text>
            <Text type="secondary" style={{ fontSize: 16, marginTop: "60px" }}>
              Only support MP4 files. Max file size 30MB.
            </Text>
          </div>
        </Dragger>
      )}

      {step === "form" && file && (
        <div>
          <Title level={4} style={{ marginBottom: "24px" }}>
            Details
          </Title>
          <Row gutter={24}>
            <Col span={14}>
              <Form layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                  label="Title"
                  name="title"
                  rules={[{ required: true, message: "Please enter a title" }]}
                >
                  <Input placeholder="Add a title that describes your video" />
                </Form.Item>

                <Form.Item label="Description" name="description">
                  <Input.TextArea rows={5} placeholder="Add description" />
                </Form.Item>

                {progress > 0 && (
                  <Progress
                    percent={progress}
                    status={progress === 100 ? "success" : "active"}
                    style={{ marginBottom: 12 }}
                  />
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  <Button onClick={handleBack}>Back</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    disabled={loading}
                  >
                    Upload
                  </Button>
                </div>
              </Form>
            </Col>

            <Col span={10}>
              <video
                src={URL.createObjectURL(file)}
                controls
                style={{
                  width: "100%",
                  borderRadius: 8,
                  marginBottom: 16,
                  backgroundColor: "#000",
                }}
              />
              <Typography.Text type="secondary">{file.name}</Typography.Text>
            </Col>
          </Row>
        </div>

        // <div style={{ padding: "24px 0" }}>
        //   <Title level={4}>Video Information</Title>
        //   <video
        //     src={URL.createObjectURL(file)}
        //     controls
        //     style={{
        //       width: "100%",
        //       borderRadius: 8,
        //       marginBottom: 16,
        //       backgroundColor: "#000",
        //     }}
        //   />
        //   <Form layout="vertical" onFinish={handleSubmit}>
        //     <Form.Item
        //       label="Video name"
        //       name="name"
        //       rules={[{ required: true, message: "Please enter a name" }]}
        //     >
        //       <Input placeholder="Enter video name" />
        //     </Form.Item>

        //     <Form.Item label="Description" name="description">
        //       <Input.TextArea rows={3} placeholder="Enter video description" />
        //     </Form.Item>

        //     <div
        //       style={{
        //         display: "flex",
        //         justifyContent: "space-between",
        //         marginTop: 24,
        //       }}
        //     >
        //       <Button onClick={handleBack}>Back</Button>
        //       <Button type="primary" htmlType="submit">
        //         Continue
        //       </Button>
        //     </div>
        //   </Form>
        // </div>
      )}
    </div>
  );
};

export default UploadVideo;
