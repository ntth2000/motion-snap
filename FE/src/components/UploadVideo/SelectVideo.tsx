import { UploadOutlined } from "@ant-design/icons";
import {
  Upload,
  Typography,
  type UploadProps,
} from "antd";
import { useState } from "react";

const { Text, Title } = Typography;
const { Dragger } = Upload;

const SelectVideo: React.FC = () => {
  const [file, setFile] = useState<any>(null);
  const [step, setStep] = useState<"upload" | "form">("upload");
  const [disabled, setDisabled] = useState(false);
  console.log(file, step)

  const handleBeforeUpload = (file: File) => {
    setFile(file);
    setDisabled(true);
    setStep("form");
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

  return (
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
  )
}

export default SelectVideo;