import { Button, Form, Input, message, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { register } from '../../../services/authService';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const handleFinish = async ({ name, email, password }: { name: string, email: string, password: string }) => {
    try {
      setLoading(true);

      await register({ username: name, email, password });

      messageApi.open({
        type: 'success',
        content: t('auth.register.message.success'),
      });

      setTimeout(() => {
        form.resetFields();
        navigate('/login', { replace: true });
      }, 1000);
    } catch (err: any) {
      message.destroy('register-error');
      messageApi.open({
        key: 'register-error',
        type: 'error',
        content: err?.response?.data?.detail || t('auth.register.message.failed'),
      });
    } finally {
      setLoading(false);
    }
  };

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
                {t('auth.register.title')}
              </Title>
              <Text className="text-slate-500 text-sm font-light">
                {t('auth.register.hint')}
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
                    {t('auth.register.username')}
                  </span>
                }
                name="name"
                rules={[{ required: true, message: t('auth.register.message.usernameRequired') }]}
              >
                <Input
                  placeholder="Jane Doe"
                  className="!font-light !text-sm placeholder:!text-slate-300"
                  autoComplete="name"
                  disabled={loading}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider ml-1">
                    {t('auth.register.email')}
                  </span>
                }
                name="email"
                rules={[
                  { required: true, message: t('auth.register.message.emailRequired') },
                  { type: 'email', message: t('auth.register.message.invalidEmail') },
                ]}
              >
                <Input
                  placeholder="you@example.com"
                  className="!font-light !text-sm placeholder:!text-slate-300"
                  autoComplete="email"
                  disabled={loading}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider ml-1">
                    {t('auth.register.password')}
                  </span>
                }
                name="password"
                rules={[
                  { required: true, message: t('auth.register.message.passwordRequired') },
                  { min: 6, message: t('auth.register.message.passwordTooShort') },
                ]}
              >
                <Input.Password
                  placeholder="••••••••"
                  className="!font-light !text-sm placeholder:!text-slate-300"
                  autoComplete="new-password"
                  disabled={loading}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider ml-1">
                    {t('auth.register.confirmPassword')}
                  </span>
                }
                name="confirm"
                dependencies={['password']}
                rules={[
                  { required: true, message: t('auth.register.message.passwordMismatch') },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(t('auth.register.message.passwordMismatch'))
                      );
                    },
                  }),
                ]}
                className="!mb-8"
              >
                <Input.Password
                  placeholder="••••••••"
                  className="!font-light !text-sm placeholder:!text-slate-300"
                  autoComplete="new-password"
                  disabled={loading}
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
                  {t('auth.register.registerBtn')}
                </Button>
              </Form.Item>
            </Form>

            <div className="flex flex-col items-center gap-6 mt-2">
              <div className="text-center">
                <Text className="text-slate-500 text-sm">
                  {t('auth.register.haveAccount')}{' '}
                </Text>
                <Link
                  to="/login"
                  className="text-sm text-[#91caff] hover:text-[#7dbbff] font-medium transition-colors"
                >
                  {t('auth.register.loginLink')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
