import { LockOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Form, Input, Typography } from 'antd';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Logo from '../../../components/UI/Logo';
import { adminLogin } from '../../../services/adminService';

const { Title, Text } = Typography;

export default function AdminLogin() {
  const { t } = useTranslation()
  const navigate = useNavigate();
  const [messageApi, msgContextHolder] = message.useMessage();
  const onFinish = async (values: any) => {
    try {
      await adminLogin(values);
      messageApi.open({
        type: 'success',
        content: t('auth.login.message.success'),
      });

      navigate('/admin/dashboard');
    } catch (err: any) {
      messageApi.open({
        type: 'error',
        content: err?.response?.data?.detail ||
          t('auth.login.message.invalidCredentials'),
      });
    }
  };

  return (
    <>
      {msgContextHolder}
      <div className="bg-[#f5f5f5] min-h-screen flex items-center justify-center p-6 font-display text-slate-800">
        <div className="w-full max-w-[440px] flex flex-col items-center">
          <div className="flex flex-col items-center mb-8">
            <Logo />
            <Title
              level={4}
              className="!mb-0 !mt-0 !text-xl !font-semibold !tracking-tight !text-slate-900"
            >
              MotionSnap
            </Title>
            <Text className="text-slate-400 text-sm tracking-wide">
              {t("admin.console")}
            </Text>
          </div>

          <div className="w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-10">
            <div className="mb-8">
              <Title
                level={2}
                className="!mb-2 !text-3xl !font-light !text-slate-900"
              >
                {t("auth.login.adminTitle")}
              </Title>
              <Text className="text-slate-500 text-sm font-light">
                {t("auth.login.adminConsoleSubtitle")}
              </Text>
            </div>

            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: '#91caff',
                  borderRadius: 8,
                  controlHeight: 48,
                },
                components: {
                  Input: {
                    colorBgContainer: '#f8fafc', // slate-50
                    colorBorder: '#e2e8f0', // slate-200
                    activeBorderColor: '#91caff',
                    hoverBorderColor: '#91caff',
                  },
                  Button: {
                    colorPrimary: '#91caff',
                    colorPrimaryHover: '#7dbbff',
                    colorPrimaryActive: '#7dbbff',
                    boxShadow: '0 10px 15px -3px rgba(145, 202, 255, 0.2)',
                  },
                },
              }}
            >
              <Form
                name="admin_login"
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
                requiredMark={false}
                className="space-y-2"
              >
                <Form.Item
                  label={
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider ml-1">
                      {t('auth.login.email')}
                    </span>
                  }
                  name="email"
                  rules={[
                    { required: true, message: t("auth.login.message.emailRequired") },
                    { type: 'email', message: t("auth.login.message.invalidEmail") },
                  ]}
                >
                  <Input
                    placeholder="admin@motioncapture.com"
                    className="!font-light !text-sm placeholder:!text-slate-300"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider ml-1">
                      {t('auth.login.password')}
                    </span>
                  }
                  name="password"
                  rules={[
                    { required: true, message: t("auth.login.message.passwordRequired") },
                  ]}
                  className="!mb-8"
                >
                  <Input.Password
                    placeholder="••••••••"
                    className="!font-light !text-sm placeholder:!text-slate-300"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    className="font-medium shadow-lg shadow-[#91caff]/20 h-12"
                  >
                    Sign In to Console
                  </Button>
                </Form.Item>
              </Form>
            </ConfigProvider>

            <div className="flex flex-col items-center gap-6 mt-2">
              {/* <Link
              href="#"
              className="!text-xs !text-[#91caff] hover:!text-[#7dbbff] !font-medium transition-colors"
            >
              Forgot Password?
            </Link> */}
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                <LockOutlined className="text-lg text-slate-400" />
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.1em]">
                  Secure Administrator Login
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
