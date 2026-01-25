import {
  AreaChartOutlined,
  DashboardOutlined,
  KeyOutlined,
  LogoutOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  Breadcrumb,
  Dropdown,
  Layout,
  Menu,
} from 'antd';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import AvatarUI from '../../components/UI/Avatar';
import Logo from '../../components/UI/Logo';
import useAuth from '../../hooks/useAuth';


const { Header, Sider, Content } = Layout;

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveKey = () => {
    const path = location.pathname;
    if (path.includes('/admin/posts')) return 'posts';
    if (path.includes('/admin/users')) return 'users';
    if (path.includes('/admin/api-keys')) return 'api-keys';
    return 'dashboard';
  };

  const activeKey = getActiveKey();

  const userMenuItems = [
    {
      key: 'logout',
      label: (
        <div className="flex items-center gap-2 text-red-500">
          <LogoutOutlined />
          <span>{t('topbar.menu.logout')}</span>
        </div>
      ),
      onClick: logout,
    },
  ];


  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: t("admin.dashboard.title"),
    },
    {
      key: 'posts',
      icon: <AreaChartOutlined />,
      label: t("admin.managePost.title"),
    },
    {
      key: 'api-keys',
      icon: <KeyOutlined />,
      label: t("admin.manageAPIKey.title"),
    },
    {
      key: 'users',
      icon: <TeamOutlined />,
      label: t("admin.manageUser.title"),
    },
  ];

  const getBreadcrumbItems = () => {
    const items = [{ title: <span className="text-slate-400 text-sm font-medium">Admin</span> }];
    switch (activeKey) {
      case 'users':
        items.push({ title: <span className="text-slate-900 text-sm font-medium">{t("admin.manageUser.title")}</span> });
        break;
      case 'posts':
        items.push({ title: <span className="text-slate-900 text-sm font-medium">{t("admin.managePost.title")}</span> });
        break;
      case 'api-keys':
        items.push({ title: <span className="text-slate-900 text-sm font-medium">{t("admin.manageAPIKey.title")}</span> });
        break;
      default:
        items.push({ title: <span className="text-slate-900 text-sm font-medium">{menuItems.find(i => i.key === activeKey)?.label}</span> });
    }
    return items;
  };


  return (
    <Layout className="min-h-screen font-display">
      <Sider
        width={256}
        theme="light"
        breakpoint="lg"
        collapsedWidth="0"
        className="border-r border-slate-200 dark:border-slate-800 bg-white fixed h-screen left-0 top-0 bottom-0 z-10"
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center gap-3">
            <Logo />
            <div className="flex flex-col">
              <h1 className="text-slate-900 text-sm font-semibold tracking-tight">
                MotionSnap
              </h1>
              <p className="text-slate-400 text-xs font-normal">{t("admin.console")}</p>
            </div>
          </div>

          <Menu
            mode="inline"
            selectedKeys={[activeKey]}
            onClick={({ key }) => navigate(key === 'dashboard' ? '/admin/dashboard' : `/admin/${key}`)}
            className="border-r-0 px-4"
            items={menuItems.map((item) => ({
              ...item,
              className:
                activeKey === item.key
                  ? 'bg-primary/10 text-primary font-medium rounded-lg'
                  : '',
            }))}
          />

          <div className="flex-1" />

          {/* User Profile */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 px-2">
              <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                <div className="rounded-full border-1 border-[#8fc9ff] cursor-pointer">
                  <AvatarUI name="Admin" />
                </div>
              </Dropdown>

              <div className="flex flex-col min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">Admin</p>
                <p className="text-[10px] text-slate-400 truncate">{t("admin.systemAdmin")}</p>
              </div>
            </div>
          </div>
        </div>
      </Sider>

      <Layout className="flex flex-col h-screen overflow-hidden">
        <Header
          className="px-8 bg-white border-b border-slate-200 h-16 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Breadcrumb
              items={getBreadcrumbItems()}
              separator={<span className="text-slate-300">/</span>}
            />
          </div>
          {/* <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<SearchOutlined />}
              className="text-slate-400 hover:text-slate-600"
            />
            <Button
              type="text"
              icon={<BellOutlined />}
              className="text-slate-400 hover:text-slate-600"
            />
          </div> */}
        </Header>

        <Content
          className="m-0 overflow-y-auto bg-background-light p-8"
        >
          <div className="max-w-6xl mx-auto space-y-6">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}