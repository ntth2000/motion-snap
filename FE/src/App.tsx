import './styles/base.css';
import { Route, Routes } from 'react-router';
import { routes } from './routes';
import { ConfigProvider } from 'antd';
import PrivateRoute from './components/PrivateRoute';

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
          {routes.map(({ path, Component, isPrivate }) => (
            isPrivate ?
              <Route path={path} element={<PrivateRoute Component={Component} />} />
              : <Route path={path} element={<Component />} />
          ))}
        </Routes>
      </ConfigProvider>
    </div>
  );
}

export default App;
