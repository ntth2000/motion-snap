import { KeyOutlined, UserOutlined } from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import AppLayout from "../../layout/AppLayout";

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = location.pathname.split("/").pop();

  return (
    <AppLayout>
      <Layout style={{ height: "100%" }}>
        <Sider width={200} style={{ background: "#fff" }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey!]}
            style={{ height: "100%", borderRight: 0 }}
            onClick={({ key }) => navigate(`/settings/${key}`)}
            items={[
              {
                key: "profile",
                icon: <UserOutlined />,
                label: "Your profiles",
              },
              {
                key: "key",
                icon: <KeyOutlined />,
                label: "API Key",
              },
            ]}
          />
        </Sider>

        <Layout style={{ paddingLeft: 24 }}>
          <Content
            style={{
              background: "#fff",
              padding: 24,
              margin: 0,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </AppLayout>
  );
};

export default Settings;
