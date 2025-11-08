import { Button, Divider, Form, Input, message, Typography } from 'antd';
import AuthLayout from '../../layout/AuthLayout';
// import GoogleIcon from '../../assets/icons/Google';
import { login } from '../../services/authService';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export default function LoginPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const handleFinish = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      setLoading(true);
      await login({ email, password });
      messageApi.open({
        type: 'success',
        content: 'Logged in successfully! Redirect to home page.',
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
        content: err?.response?.data?.detail || 'Login failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={<Typography.Title level={3}>Welcome back to MotionSnap</Typography.Title>}
      subtitle="Please sign in to continue"
    >
      {contextHolder}
      <Form
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        requiredMark={false}
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' },
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
          label="Password"
          rules={[{ required: true, message: 'Please enter your password' }]}
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
            Sign in
          </Button>
        </Form.Item>
      </Form>
      <Divider />

      <div style={{ textAlign: 'center' }}>
        <Typography.Text> Don't have an account? </Typography.Text>
        <Typography.Link strong href="/register">
          Sign up here
        </Typography.Link>
      </div>
    </AuthLayout>
  );
}
