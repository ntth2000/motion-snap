import { Button, Card, Col, Divider, Form, Input, message, Row, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import useAuth from '../../../hooks/useAuth';
import AuthLayout from '../../../layout/AuthLayout';
import Title from 'antd/lib/typography/Title';
import { useTranslation } from 'react-i18next';

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
      console.log(res)
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
    <div style={{ width: '100%', minHeight: "70vh", maxWidth: 480, margin: '16px auto', display: "flex", alignItems: "center", justifyContent: "center" }}>
      {contextHolder}
      <Card bordered style={{ width: '100%', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
        <Title
          level={4}
          style={{ marginBottom: 8, textAlign: 'center' }}
        >
          {t('auth.login.title')}
        </Title>
        <div
          style={{
            marginBottom: 24,
            textAlign: 'center',
            color: 'rgba(0,0,0,0.65)',
          }}
        >
          {t('auth.login.hint')}
        </div>

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
              style={{ width: '100%' }}
            >
              {t('auth.login.loginBtn')}
            </Button>
          </Form.Item>
        </Form>
        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Typography.Text> {t('auth.login.noAccount')} </Typography.Text>
          <Typography.Link strong href="/register">
            {t('auth.login.registerLink')}
          </Typography.Link>
        </div>
      </Card>
    </div>
  );
}
