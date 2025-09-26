import { Button, Divider, Form, Input, Typography } from 'antd'
import AuthLayout from '../../layout/AuthLayout'
import GoogleIcon from '../../assets/icons/Google'

export default function LoginPage() {
  const [form] = Form.useForm()

  const handleFinish = (values: unknown) => {
    // Replace with real submit
    // eslint-disable-next-line no-console
    console.log('Login submit:', values)
  }

  return (
    <AuthLayout title={<Typography.Text strong>Welcome back</Typography.Text>} subtitle="Please sign in to continue">
      <Form layout="vertical" form={form} onFinish={handleFinish} requiredMark={false}>
        <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Please enter a valid email' }]}>
          <Input placeholder="you@example.com" size="large" autoComplete="email" />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please enter your password' }]}>
          <Input.Password placeholder="••••••••" size="large" autoComplete="current-password" />
        </Form.Item>
        <Form.Item className="px-2">
          <Button type="primary" htmlType="submit" block size="large">
            Sign in
          </Button>
        </Form.Item>
        <Divider plain>OR</Divider>
        <Form.Item>
          <Button block size="large" icon={<GoogleIcon width="18" height="18" />}>
            Sign in with Google
          </Button>
        </Form.Item>
      </Form>
    </AuthLayout>
  )
}
