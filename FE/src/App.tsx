import './styles/base.css';

import { ConfigProvider } from 'antd';
import { Navigate, Route, Routes } from 'react-router';

import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import { privateRoutes, publicRoutes } from './routes';

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
            {publicRoutes.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>
          <Route element={<PrivateRoute />}>
            {privateRoutes.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ConfigProvider>
    </div>
  );
}

export default App;
