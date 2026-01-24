import {
  BellOutlined,
  DashboardOutlined,
  KeyOutlined,
  SearchOutlined,
  TeamOutlined,
  AreaChartOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import {
  Breadcrumb,
  Button,
  Dropdown,
  Layout,
  Menu,
} from 'antd';
import Dashboard from './Dashboard';
import ManagePost from './ManagePost';
import ManageUser from './ManageUser';
import ManageApiKey from './ManageApiKey';
import { useState } from 'react';
import AvatarUI from '../../components/UI/Avatar';
import { useTranslation } from 'react-i18next';
import Logo from '../../components/UI/Logo';
import useAuth from '../../hooks/useAuth';


const { Header, Sider, Content } = Layout;

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [activeKey, setActiveKey] = useState('dashboard');

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
      key: 'job_monitoring',
      icon: <AreaChartOutlined />,
      label: t("admin.managePost.title"),
    },
    {
      key: 'api_keys',
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
      case 'job_monitoring':
        items.push({ title: <span className="text-slate-900 text-sm font-medium">{t("admin.managePost.title")}</span> });
        break;
      case 'api_keys':
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
            onClick={({ key }) => setActiveKey(key)}
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
          <div className="flex items-center gap-4">
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
          </div>
        </Header>

        <Content
          className="m-0 overflow-y-auto bg-background-light p-8"
        >
          <div className="max-w-6xl mx-auto space-y-6">
            {activeKey === 'dashboard' && <Dashboard setActiveTab={setActiveKey} />}
            {activeKey === 'job_monitoring' && <ManagePost />}
            {activeKey === 'users' && <ManageUser />}
            {activeKey === 'api_keys' && <ManageApiKey />}
            {activeKey !== 'dashboard' && activeKey !== 'job_monitoring' && activeKey !== 'users' && activeKey !== 'api_keys' && (
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-light tracking-tight text-slate-900 dark:text-white">
                  {menuItems.find((i) => i.key === activeKey)?.label}
                </h2>
                <p className="text-slate-500 text-sm">This section is under construction.</p>
              </div>
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}