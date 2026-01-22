import { Button, Card, Divider, Form, Input, message, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import useAuth from '../../../hooks/useAuth';

const { Title, Paragraph } = Typography;

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
        content: 'Logged in successfully! Redirect to home page.',
      });

      setTimeout(() => {
        form.resetFields();
        if (res.role === 'ADMIN') {
          navigate('/admin/dashboard', { replace: true });
          return;
        } else {
          navigate('/', { replace: true });
        }
      }, 1000);
    } catch (err: any) {
      messageApi.destroy('login-error');
      messageApi.open({
        key: 'login-error',
        type: 'error',
        content: err?.response?.data?.detail || 'Login failed. Please try again.',
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
    <div className="w-full min-h-[70vh] max-w-120 m-4 mx-auto! flex items-center justify-center">
      {contextHolder}
      <Card className="w-full shadow-xl rounded-3xl">
        <Title
          level={4}
          className="mb-2 text-center"
        >
          {t('auth.login.title')}
        </Title>
        <Paragraph type="secondary" className="w-full text-center"
        >
          {t('auth.login.hint')}
        </Paragraph>
        <Form
          layout="vertical"
          form={form}
          onFinish={handleFinish}
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label={t('auth.login.email')}
            rules={[
              { required: true, message: t('auth.login.message.emailRequired') },
              { type: 'email', message: t('auth.login.message.invalidEmail') },
            ]}
          >
            <Input
              disabled={loading}
              placeholder="you@example.com"
              size="large"
              autoComplete="email"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label={t('auth.login.password')}
            rules={[{ required: true, message: t('auth.login.message.passwordRequired') }]}
          >
            <Input.Password
              disabled={loading}
              placeholder="••••••••"
              size="large"
              autoComplete="current-password"
            />
          </Form.Item>
          <Form.Item className="px-2">
            <Button
              color="default"
              variant="solid"
              loading={loading}
              htmlType="submit"
              size='large'
              className="w-full"
            >
              {t('auth.login.loginBtn')}
            </Button>
          </Form.Item>
        </Form>
        <Divider />

        <div className="text-center">
          <Typography.Text> {t('auth.login.noAccount')} </Typography.Text>
          <Typography.Link className="hover:underline!" href="/register">
            {t('auth.login.registerLink')}
          </Typography.Link>
        </div>
      </Card>
    </div>
  );
}
