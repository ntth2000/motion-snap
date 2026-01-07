import './styles/base.css';

import { ConfigProvider } from 'antd';
import { Navigate, Route, Routes } from 'react-router';
import "./i18n"
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import DashboardPage from './pages/Feed';
import LoginPage from './pages/Auth/Login';
import SettingPage from './pages/Settings';
import ApiKeySettingPage from './pages/Settings/ApiKeySetting';
import ProfileSettingPage from './pages/Settings/ProfileSetting';
import VideoPage from './pages/Video';
import AdminDashboardPage from './pages/Admin/AdminDashboard';
import RegisterPage from './pages/Auth/Register';
import AppLayout from './components/layout';

function App() {
  return (
    <div>
      <ConfigProvider
        theme={{
          token: {
            colorBgBase: '#fff',
            colorPrimary: "#1677ff",
          },
          hashed: false,
          components: {
            Modal: {
              wireframe: true,
            },
            Layout: {
              headerBg: '#fff',
            },
          },
        }}
      >
        <AppLayout>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<PrivateRoute allowedRoles={['USER']} />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/video/:videoId" element={<VideoPage />} />
              <Route path="/settings" element={<SettingPage />}>
                <Route index element={<Navigate to="profile" replace />} />
                <Route path="profile" element={<ProfileSettingPage />} />
                <Route path="key" element={<ApiKeySettingPage />} />
              </Route>
            </Route>

            <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/" element={<AdminDashboardPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>

      </ConfigProvider>
    </div>
  );
}

export default App;
