import { Button, Divider, Form, Input, message, Typography } from 'antd';
import AuthLayout from '../../layout/AuthLayout';
import { useState } from 'react';
import { register } from '../../services/authService';
import { useNavigate } from 'react-router';

export default function RegisterPage() {
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
        content: 'Registered successfully! Please login.',
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
        content: err?.response?.data?.detail || 'Registration failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={<Typography.Text strong>Create your account</Typography.Text>}
      subtitle="Sign up to get started"
    >
      {contextHolder}
      <Form
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        requiredMark={false}
      >
        <Form.Item
          name="name"
          label="Full name"
          rules={[{ required: true, message: 'Please enter your full name' }]}
        >
          <Input placeholder="Jane Doe" size="large" autoComplete="name" disabled={loading} />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input
            placeholder="you@example.com"
            size="large"
            autoComplete="email"
            disabled={loading}
          />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: 'Please enter your password' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <Input.Password
            placeholder="••••••••"
            size="large"
            autoComplete="new-password"
          />
        </Form.Item>
        <Form.Item
          name="confirm"
          label="Confirm password"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error('The two passwords do not match')
                );
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="••••••••"
            size="large"
            autoComplete="new-password"
            disabled={loading}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Create account
          </Button>
        </Form.Item>
        {/* <Divider plain>OR</Divider>
        <Form.Item>
          <Button
            block
            size="large"
            icon={<GoogleIcon width="18" height="18" />}
            disabled={loading}
          >
            Sign in with Google
          </Button>
        </Form.Item> */}
      </Form>
      <Divider />

      <div style={{ textAlign: 'center' }}>
        <Typography.Text> You already have an account? </Typography.Text>
        <Typography.Link strong href="/login">
          Login here
        </Typography.Link>
      </div>
    </AuthLayout>
  );
}
