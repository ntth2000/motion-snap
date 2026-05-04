import { Button, Form, Input, message, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import useAuth from '../../../hooks/useAuth';

const { Title, Text } = Typography;

export default function LoginPage() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleFinish = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      setLoading(true);
      const res = await login({ email, password });
      messageApi.open({
        type: 'success',
        content: t('auth.login.message.success'),
      });

      setTimeout(() => {
        form.resetFields();
        navigate('/', { replace: true });
      }, 1000);
    } catch (err: any) {
      messageApi.destroy('login-error');
      messageApi.open({
        key: 'login-error',
        type: 'error',
        content: err?.response?.data?.detail || t('auth.login.message.failed'),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("LoginPage mounted");
    return () => console.log("LoginPage unmounted");
  }, []);

  return (
    <>
      {contextHolder}
      <div className="bg-[#f5f5f5] min-h-screen flex items-center justify-center p-6 font-display text-slate-800">
        <div className="w-full max-w-[440px] flex flex-col items-center">
          <div className="w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-10">
            <div className="mb-8">
              <Title
                level={2}
                className="!mb-2 !text-3xl !font-light !text-slate-900"
              >
                {t('auth.login.title')}
              </Title>
              <Text className="text-slate-500 text-sm font-light">
                {t('auth.login.hint')}
              </Text>
            </div>

            <Form
              layout="vertical"
              form={form}
              onFinish={handleFinish}
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
                  { required: true, message: t('auth.login.message.emailRequired') },
                  { type: 'email', message: t('auth.login.message.invalidEmail') },
                ]}
              >
                <Input
                  disabled={loading}
                  placeholder="you@example.com"
                  className="!font-light !text-sm placeholder:!text-slate-300"
                  autoComplete="email"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider ml-1">
                    {t('auth.login.password')}
                  </span>
                }
                name="password"
                rules={[{ required: true, message: t('auth.login.message.passwordRequired') }]}
                className="!mb-8"
              >
                <Input.Password
                  disabled={loading}
                  placeholder="••••••••"
                  className="!font-light !text-sm placeholder:!text-slate-300"
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="font-medium shadow-lg shadow-[#91caff]/20 h-12"
                >
                  {t('auth.login.loginBtn')}
                </Button>
              </Form.Item>
            </Form>

            <div className="flex flex-col items-center gap-6 mt-6">
              <div className="text-center">
                <Text className="text-slate-500 text-sm">
                  {t('auth.login.noAccount')}{' '}
                </Text>
                <Link
                  to="/register"
                  className="text-sm text-[#91caff] hover:text-[#7dbbff] font-medium transition-colors"
                >
                  {t('auth.login.registerLink')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
