import './styles/base.css';
import "./i18n";

import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider } from 'antd';
import { lazy, Suspense } from 'react'; //
import { Navigate, Outlet, Route, Routes } from 'react-router';

import AppLayout from './components/layout';
import PublicRoute from './components/PublicRoute';
import Spinner from './components/UI/Spinner';
import PrivateRoute from './components/PrivateRoute';

const DashboardPage = lazy(() => import('./pages/Feed'));
const LoginPage = lazy(() => import('./pages/Auth/Login'));
const AdminLogin = lazy(() => import('./pages/Auth/AdminLogin'));
const RegisterPage = lazy(() => import('./pages/Auth/Register'));
const PostPage = lazy(() => import('./pages/Post'));
const AdminDashboardPage = lazy(() => import('./pages/Admin'));
const UserProfile = lazy(() => import('./pages/Profile'));
const MyVideosPage = lazy(() => import('./pages/MyVideos'));

function App() {
  return (
    <StyleProvider layer>
      <ConfigProvider
        theme={{
          token: {
            colorBgBase: '#fff',
            colorPrimary: "#60a5fa",
            colorText: '#222',
            colorTextSecondary: '666',
            colorTextHeading: '#1e293b',
            colorTextDescription: '#64748b',
            colorLink: '#60a5fa',
            colorLinkHover: '#60a5fa',
            fontWeightStrong: 500
          },
          hashed: false,
          components: {
            Modal: { wireframe: true },
            Layout: { headerBg: '#fff' }
          },
        }}
      >

        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Spinner /></div>}>
          <Routes >
            <Route element={
              <AppLayout>
                <Outlet />
              </AppLayout>
            }>
              <Route path="/posts/:postId" element={<PostPage />} />
              <Route path="/profile/:username" element={<UserProfile />} />
              <Route path="/" element={<DashboardPage />} />
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>
              <Route element={<PrivateRoute allowedRoles={['USER']} />}>
                <Route path="/my-videos" element={<MyVideosPage />} />
              </Route>
            </Route>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<div><Outlet /></div>}>
              <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/" element={<AdminDashboardPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ConfigProvider>
    </StyleProvider>
  );
}

export default App;