import { CopyOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, message, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { generateKey, getKey } from "../../../services/apiKeyService";

const { Text } = Typography;

const maskKey = (key: string) => {
  if (key.length <= 8) return "****************";
  return `${key.slice(0, 4)}****************${key.slice(-4)}`;
};

type ApiKeyState = {
  key: string | null;
  canCopy: boolean;
  isRevoked?: boolean;
};

export default function ApiKeySetting({ }) {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState<ApiKeyState>({ key: null, canCopy: false });
  const [loading, setLoading] = useState(false);
  const [messageApi, msgContextHolder] = message.useMessage();

  const fetchApiKey = async () => {
    try {
      setLoading(true);
      const res = await getKey();
      setApiKey({ key: res.key, canCopy: false, isRevoked: res.isRevoked });
    } catch (err) {
      message.error("Failed to load API key");
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = async () => {
    try {
      setLoading(true);
      const res = await generateKey();
      setApiKey({ key: res.key, canCopy: true });
      messageApi.open({
        content: t('apiKeySetting.message.regenerateSuccess'),
        type: "success",
      });
    } catch (err) {
      messageApi.open({
        content: t('apiKeySetting.message.regenerateFailed'),
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
      content: t('apiKeySetting.message.copySuccess'),
      type: "success",
    });
  };

  useEffect(() => {
    fetchApiKey();
  }, []);

  return (
    <div className="px-4 mt-4 mb-15 text-slate-600 dark:text-slate-300">
      {msgContextHolder}
      <div className="mb-6">
        <p className="whitespace-pre-line">
          {t('apiKeySetting.description')}
        </p>
      </div>
      {
        apiKey.key ? (
          <Space direction="vertical" size="middle">
            <div>
              <span
                style={{
                  background: "#fafafa",
                  border: "1px solid #eee",
                  padding: "12px 16px",
                  borderRadius: 6,
                  fontFamily: "monospace",
                  marginRight: 12
                }}
              >
                {apiKey.canCopy ? maskKey(apiKey.key) : apiKey.key}
              </span>

              <Space>
                {apiKey.canCopy && <Button
                  icon={<CopyOutlined />}
                  onClick={copyApiKey}
                >
                  {t('apiKeySetting.copyBtn')}
                </Button>}

                <Button
                  danger
                  icon={<ReloadOutlined />}
                  loading={loading}
                  onClick={generateApiKey}
                >
                  {t('apiKeySetting.regenerateBtn')}
                </Button>
              </Space>
            </div>
            {apiKey.isRevoked ? (
              <Text type="danger" className="mt-2">{t('apiKeySetting.revoked')}</Text>
            ) : null
            }
          </Space>
        ) : (
          <Button
            danger
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={generateApiKey}
          >
            {t('apiKeySetting.generateBtn')}
          </Button>
        )
      }
      <div className="mt-8">
        <p className="text-slate-600 dark:text-slate-300">{t('apiKeySetting.info')}</p>
        <br />
        <p className="text-slate-600 dark:text-slate-300">For more information, please refer to the <a href="https://github.com/ntth2000/multiple-camera-remote" target="_blank">Multiple camera remote</a> repository.</p>
      </div>
    </div >
  );
};