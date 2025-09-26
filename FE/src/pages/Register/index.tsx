import { Button, Divider, Form, Input, Typography } from 'antd'
import AuthLayout from '../../layout/AuthLayout'
import GoogleIcon from '../../assets/icons/Google'

export default function RegisterPage() {
  const [form] = Form.useForm()

  const handleFinish = (values: unknown) => {
    // Replace with real submit
    // eslint-disable-next-line no-console
    console.log('Register submit:', values)
  }

  return (
    <AuthLayout title={<Typography.Text strong>Create your account</Typography.Text>} subtitle="Sign up to get started">
      <Form layout="vertical" form={form} onFinish={handleFinish} requiredMark={false}>
        <Form.Item name="name" label="Full name" rules={[{ required: true, message: 'Please enter your full name' }]
        }>
          <Input placeholder="Jane Doe" size="large" autoComplete="name" />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Please enter a valid email' }]}>
          <Input placeholder="you@example.com" size="large" autoComplete="email" />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please enter your password' }, { min: 6, message: 'Password must be at least 6 characters' }]}>
          <Input.Password placeholder="••••••••" size="large" autoComplete="new-password" />
        </Form.Item>
        <Form.Item name="confirm" label="Confirm password" dependencies={["password"]} rules={[{ required: true, message: 'Please confirm your password' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('password') === value) { return Promise.resolve() } return Promise.reject(new Error('The two passwords do not match')) } })]}>
          <Input.Password placeholder="••••••••" size="large" autoComplete="new-password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            Create account
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