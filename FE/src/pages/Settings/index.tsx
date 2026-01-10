import { KeyOutlined, UserOutlined } from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";


const Settings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = location.pathname.split("/").pop();

  return (
    <Layout style={{ minHeight: "100%", flex: 1 }}>
      <Sider width={200} style={{ height: '100%', background: "#fff", borderRadius: 8, overflow: 'hidden' }}>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey!]}
          style={{ height: "100%", borderRight: 0 }}
          onClick={({ key }) => navigate(`/settings/${key}`)}
          items={[
            {
              key: "profile",
              icon: <UserOutlined />,
              label: t('pages.settings.menu.profile'),
            },
            {
              key: "key",
              icon: <KeyOutlined />,
              label: t('pages.settings.menu.apiKey'),
            },
          ]}
        />
      </Sider>

      <Content
        style={{
          paddingLeft: 24,
          display: 'flex',
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: 24,
            minHeight: '100%',
            flexGrow: 1,
            borderRadius: 8,
          }}
        >
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};

export default Settings;
