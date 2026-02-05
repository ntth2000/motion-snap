
import {
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  message,
  Modal,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getApiKeys, revokeApiKey } from '../../../services/adminService';

const { Title, Text } = Typography;
const { confirm } = Modal;

interface DataType {
  key: string;
  id: number;
  owner: {
    name: string;
    role: string;
    avatarUrl: string;
  };
  maskedKey: string;
  status: 'active' | 'revoked';
}

export default function ManageApiKey() {
  const { t } = useTranslation();
  const [modal, modalContextHolder] = Modal.useModal();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataType[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchData = async (page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const res = await getApiKeys({ page, pageSize });
      const items = res.items.map((item: any) => ({
        key: item.id.toString(),
        id: item.id,
        owner: {
          name: item.user?.name || item.user?.email || 'Unknown',
          role: item.user?.role || 'User',
          avatarUrl: `https://ui-avatars.com/api/?name=${item.user?.name || 'User'}&background=random`,
        },
        maskedKey: `${item.prefix}...`,
        status: item.is_revoked ? 'revoked' : 'active',
      }));

      setData(items);
      setPagination(prev => ({ ...prev, current: page, total: res.total }));
    } catch (error) {
      console.error(error);
      message.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize);
  }, []);

  const handleTableChange = (newPagination: any) => {
    fetchData(newPagination.current, newPagination.pageSize);
  };

  const handleRevoke = (keyId: number) => {
    modal.confirm({
      title: t('admin.manageAPIKey.revokeConfirm'),
      icon: <ExclamationCircleOutlined />,
      okText: t('admin.manageAPIKey.revokeBtn'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          await revokeApiKey(keyId);
          messageApi.open({
            type: 'success',
            content: t('admin.manageAPIKey.revokeSuccess'),
          });
          fetchData(pagination.current, pagination.pageSize);
        } catch (error) {
          console.error(error);
          messageApi.open({
            type: 'error',
            content: t('admin.manageAPIKey.revokeError'),
          });
        }
      },
    });
  };

  const renderStatusTag = (status: 'active' | 'revoked') => {
    if (status === 'active') {
      return (
        <Tag className="bg-success-pastel text-[#15803d] border-none rounded-full px-2.5 py-0.5 text-xs font-medium">
          {t('admin.manageAPIKey.status.active')}
        </Tag>
      );
    }
    return (
      <Tag className="bg-error-pastel text-[#b91c1c] border-none rounded-full px-2.5 py-0.5 text-xs font-medium">
        {t('admin.manageAPIKey.status.revoked')}
      </Tag>
    );
  };

  const columns: ColumnsType<DataType> = [
    {
      title: t('admin.manageAPIKey.table.owner'),
      dataIndex: 'owner',
      key: 'owner',
      render: (owner) => (
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-slate-100 overflow-hidden">
            <img alt="User avatar" className="w-full h-full object-cover" src={owner.avatarUrl} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900 dark:text-white">{owner.name}</span>
            <span className="text-[10px] text-slate-400">{owner.role}</span>
          </div>
        </div>
      ),
    },
    {
      title: t('admin.manageAPIKey.table.maskedKey'),
      dataIndex: 'maskedKey',
      key: 'maskedKey',
      render: (text) => (
        <code className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded">
          {text}
        </code>
      ),
    },
    {
      title: t('admin.manageAPIKey.table.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => renderStatusTag(status),
    },
    {
      title: t('admin.manageAPIKey.table.actions'),
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        record.status === 'active' ? (
          <button
            className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors px-3 py-1.5 border border-red-100 hover:border-red-200 rounded-lg bg-transparent cursor-pointer"
            onClick={() => handleRevoke(record.id)}
          >
            {t('admin.manageAPIKey.table.revokeKey')}
          </button>
        ) : (
          <button className="text-xs font-medium text-slate-400 cursor-not-allowed px-3 py-1.5 border border-slate-100 rounded-lg bg-transparent" disabled>
            {t('admin.manageAPIKey.table.revoked')}
          </button>
        )
      ),
    },
  ];

  return (
    <>
      {modalContextHolder}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Title level={2} className="!mb-0 !font-light tracking-tight text-slate-900 dark:text-white">
            {t("admin.manageAPIKey.title")}
          </Title>
          <Text type="secondary" className="text-slate-500 text-sm">
            {t("admin.manageAPIKey.description")}
          </Text>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm mt-6">
        <Table
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            position: ['bottomRight'],
            showSizeChanger: false,
            itemRender: (_, type, originalElement) => {
              if (type === 'prev') {
                return <button className="px-3 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded hover:bg-white transition-colors bg-white cursor-pointer">{t('common.previous')}</button>;
              }
              if (type === 'next') {
                return <button className="mr-4 px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90 transition-colors border-none cursor-pointer">{t('common.next')}</button>;
              }
              return originalElement;
            }
          }}
          onChange={handleTableChange}
          rowClassName="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
        />
      </div>
    </>
  );
}
