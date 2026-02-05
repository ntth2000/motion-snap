import {
  EditOutlined,
  ExclamationCircleOutlined,
  KeyOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons';
import {
  Button,
  message,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AvatarUI from '../../../components/UI/Avatar';
import { deactivateUser, getUsers } from '../../../services/adminService';

const { Title } = Typography;

interface UserType {
  id: number;
  name: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
  created_at: string;
}

export default function ManageUser() {
  const { t } = useTranslation();
  const [data, setData] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, modalContextHolder] = Modal.useModal();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: false,
  });

  const fetchData = async (page: number, pageSize: number) => {
    setLoading(true);
    try {
      const response = await getUsers({ page, pageSize });
      setData(response.items);
      setPagination(prev => ({
        ...prev,
        current: page,
        total: response.total,
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pagination.current || 1, pagination.pageSize || 10);
  }, []);

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    fetchData(newPagination.current || 1, newPagination.pageSize || 10);
  };

  const renderRoleTag = (role: string) => {
    return (
      <Tag className="bg-success-pastel text-green-700 border-none rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-tight">
        {role}
      </Tag>
    );
  };

  const handleDeactivate = (userId: number) => {
    modal.confirm({
      title: t('admin.manageUser.deactivateConfirm'),
      icon: <ExclamationCircleOutlined />,
      okText: t('admin.manageUser.deactivateBtn'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await deactivateUser(userId);
          messageApi.open({
            type: 'success',
            content: t('admin.manageUser.deactivateSuccess'),
          });
          fetchData(pagination.current || 1, pagination.pageSize || 10);
        } catch (error) {
          console.error(error);
          messageApi.open({
            type: 'error',
            content: t('admin.manageUser.deactivateError'),
          });
        }
      },
    });
  }

  const columns: ColumnsType<UserType> = [
    {
      title: t('admin.manageUser.table.userName'),
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-slate-100 overflow-hidden">
            <AvatarUI name={record.name} height="h-8" width="w-8" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{text}</span>
            <span className="text-xs text-slate-400">@{record.username}</span>
          </div>

        </div>
      ),
    },
    {
      title: t('admin.manageUser.table.email'),
      dataIndex: 'email',
      key: 'email',
      render: (text) => <span className="text-sm text-slate-500">{text}</span>,
    },
    {
      title: t('admin.manageUser.table.role'),
      dataIndex: 'role',
      key: 'role',
      render: (role) => renderRoleTag(role),
    },
    {
      title: t('admin.manageUser.table.joined'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => <span className="text-xs text-slate-500">
        {text ? formatDistanceToNow(new Date(text), { addSuffix: true }) : '-'}
      </span>,
    },
    {
      title: t('admin.manageUser.table.actions'),
      key: 'actions',
      align: 'right',
      render: (record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<UserDeleteOutlined />}
            className="text-slate-400 hover:text-red-400"
            title={t('admin.manageUser.deactivateBtn')}
            onClick={() => handleDeactivate(record.id)}
          >{t('admin.manageUser.deactivateBtn')}</Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      {messageContextHolder}
      {modalContextHolder}
      <div className="flex flex-col gap-1">
        <Title level={2} className="!mb-0 !font-light tracking-tight text-slate-900 dark:text-white">
          {t('admin.manageUser.title')}
        </Title>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <Table
          columns={columns}
          dataSource={data}
          pagination={{
            ...pagination,
            itemRender: (_, type, originalElement) => {
              if (type === 'prev') {
                return <a className="px-3 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded hover:bg-white transition-colors text-black">{t('common.previous')}</a>;
              }
              if (type === 'next') {
                return <a className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90 transition-colors">{t('common.next')}</a>;
              }
              return originalElement;
            }
          }}
          loading={loading}
          onChange={handleTableChange}
          rowClassName="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
          rowKey="id"
        />
      </div>
    </>
  );
}
