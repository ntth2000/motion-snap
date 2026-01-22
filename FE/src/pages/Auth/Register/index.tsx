import { Button, Card, Divider, Form, Input, message, Typography } from 'antd';
import Title from 'antd/lib/typography/Title';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { register } from '../../../services/authService';


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
    <div className="w-full min-h-[70vh] max-w-120 my-4 mx-auto! flex items-center justify-center">
      {contextHolder}
      <Card className="w-full shadow-xl">
        <Title
          level={4}
          className="mb-2 text-center"
        >
          {t('auth.register.title')}
        </Title>
        <div
          className="mb-6 text-center text-secondary"
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
                    new Error(t('auth.register.message.passwordMismatch'))
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
              className="w-full py-4 mt-2"
            >
              {t('auth.register.registerBtn')}
            </Button>
          </Form.Item>
        </Form>
        <Divider />

        <div className="text-center">
          <Typography.Text> {t('auth.register.haveAccount')} </Typography.Text>
          <Typography.Link className="hover:underline!" href="/login">
            {t('auth.register.loginLink')}
          </Typography.Link>
        </div>
      </Card>
    </div>
  );
}
