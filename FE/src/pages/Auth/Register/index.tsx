import { Button, Card, Divider, Form, Input, message, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { register } from '../../../services/authService';
import AuthLayout from '../../../layout/AuthLayout';
import { useTranslation } from 'react-i18next';
import Title from 'antd/lib/typography/Title';


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
    <div style={{ width: '100%', minHeight: "70vh", maxWidth: 480, margin: '16px auto', display: "flex", alignItems: "center", justifyContent: "center" }}>
      {contextHolder}
      <Card bordered style={{ width: '100%', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
        <Title
          level={4}
          style={{ marginBottom: 8, textAlign: 'center' }}
        >
          {t('auth.register.title')}
        </Title>
        <div
          style={{
            marginBottom: 24,
            textAlign: 'center',
            color: 'rgba(0,0,0,0.65)',
          }}
        >
          {t('auth.register.hint')}
        </div>
        <Form
          layout="vertical"
          form={form}
          onFinish={handleFinish}
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label={t('auth.register.username')}
            rules={[{ required: true, message: t('auth.register.message.usernameRequired') }]}
          >
            <Input placeholder="Jane Doe" size="large" autoComplete="name" disabled={loading} />
          </Form.Item>
          <Form.Item
            name="email"
            label={t('auth.register.email')}
            rules={[
              { required: true, message: t('auth.register.message.emailRequired') },
              { type: 'email', message: t('auth.register.message.invalidEmail') },
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
            label={t('auth.register.password')}
            rules={[
              { required: true, message: t('auth.register.message.passwordRequired') },
              { min: 6, message: t('auth.register.message.passwordTooShort') },
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
            label={t('auth.register.confirmPassword')}
            dependencies={['password']}
            rules={[
              { required: true, message: t('auth.register.message.passwordMismatch') },
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
            <Button
              size='large'
              color="default"
              variant="solid"
              loading={loading}
              htmlType="submit"
              style={{ width: '100%', padding: '16px 0' }}
            >
              {t('auth.register.registerBtn')}
            </Button>
          </Form.Item>
        </Form>
        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Typography.Text> {t('auth.register.haveAccount')} </Typography.Text>
          <Typography.Link strong href="/login">
            {t('auth.register.loginLink')}
          </Typography.Link>
        </div>
      </Card>
    </div>
  );
}
