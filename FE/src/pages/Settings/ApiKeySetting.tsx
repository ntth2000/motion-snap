import { CopyOutlined, KeyOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Divider, message,Space, Typography } from "antd";
import { useEffect, useState } from "react";

import { generateKey, getKey } from "../../services/apiKeyService";

const { Title, Text } = Typography;

const maskKey = (key: string) => {
  if (key.length <= 8) return "****************";
  return `${key.slice(0, 4)}****************${key.slice(-4)}`;
};

type ApiKeyState = {
  key: string | null;
  canCopy: boolean;
};

const ApiKeySetting = () => {
  const [apiKey, setApiKey] = useState<ApiKeyState>({ key: null, canCopy: false });
  const [loading, setLoading] = useState(false);
  const [messageApi, msgContextHolder] = message.useMessage();

  // fetch api key
  const fetchApiKey = async () => {
    try {
      setLoading(true);
      const res = await getKey();
      setApiKey({ key: res.key, canCopy: false });
    } catch (err) {
      message.error("Failed to load API key");
    } finally {
      setLoading(false);
    }
  };

  // generate api key
  const generateApiKey = async () => {
    try {
      setLoading(true);
      const res = await generateKey();
      setApiKey({ key: res.key, canCopy: true });
      messageApi.open({
        content: "API key regenerated",
        type: "success",
      });
    } catch (err) {
      messageApi.open({
        content: "Failed to regenerate API key",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyApiKey = async () => {
    if (!(apiKey.canCopy && apiKey.key)) return;
    await navigator.clipboard.writeText(apiKey.key);
    messageApi.open({
      content: "API key copied",
      type: "success",
    });
  };

  useEffect(() => {
    fetchApiKey();
  }, []);

  return (
    <div>
      {msgContextHolder}
      <Title level={5}>
        <KeyOutlined />
        <span style={{ marginLeft: 4 }}>API Key</span>
      </Title>
      <Divider />
      <div style={{ marginBottom: 24 }}>
        <Text type="secondary">
          Use this API key to authenticate requests to our backend.<br />
          You will not be able to see it again, so copy it now and keep it secure.
        </Text>
      </div>
      {
        apiKey.key ? (
          <Space direction="vertical" size="middle">
            <Text strong>Your API Key</Text>

            <div>
              <span
                style={{
                  background: "#fafafa",
                  border: "1px solid #eee",
                  padding: "12px 16px",
                  borderRadius: 6,
                  fontFamily: "monospace",
                  marginRight: 6
                }}
              >
                {apiKey.canCopy ? maskKey(apiKey.key) : apiKey.key}
              </span>

              <Space>
                {apiKey.canCopy && <Button
                  icon={<CopyOutlined />}
                  onClick={copyApiKey}
                >
                  Copy
                </Button>}

                <Button
                  danger
                  icon={<ReloadOutlined />}
                  loading={loading}
                  onClick={generateApiKey}
                >
                  Regenerate
                </Button>
              </Space>
            </div>
          </Space>
        ) : (
          <Button
            danger
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={generateApiKey}
          >
            Generate
          </Button>
        )
      }
    </div >
  );
};

export default ApiKeySetting;
