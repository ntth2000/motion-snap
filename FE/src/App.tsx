import './styles/base.css';

import { ConfigProvider } from 'antd';
import { Navigate, Route, Routes } from 'react-router';

import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import DashboardPage from './pages/Dashboard';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import SettingPage from './pages/Settings';
import ApiKeySettingPage from './pages/Settings/ApiKeySetting';
import ProfileSettingPage from './pages/Settings/ProfileSetting';
import VideoPage from './pages/Video';

function App() {
  return (
    <div>
      <ConfigProvider
        theme={{
          token: {
            colorBgBase: '#fff',
            fontSize: 16,
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
        <Routes>
          <Route element={<PublicRoute />}>
            <Route key='login' path='/login' element={<LoginPage />} />
            <Route key='register' path='/register' element={<RegisterPage />} />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route key='video/:videoId' path='/video/:videoId' element={<VideoPage />} />
            <Route key='settings' path='/settings' element={<SettingPage />}>
              <Route index element={<Navigate to="profile" replace />} />
              <Route path="profile" element={<ProfileSettingPage />} />
              <Route path="key" element={<ApiKeySettingPage />} />
            </Route>
          </Route>
          <Route key='home' path='/' element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ConfigProvider>
    </div>
  );
}

export default App;
