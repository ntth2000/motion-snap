
import {
  DeleteOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  RightOutlined,
} from '@ant-design/icons';
import {
  Button,
  message,
  Modal,
  Space,
  Table,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { STAGE, STATUS } from '../../../constants';
import { adminDeletePost, getAdminPosts } from '../../../services/adminService';
import { displayStatus, formatDate } from '../../../utils/util';
import { getAssetUrl } from '../../../services';

const { Title, Text } = Typography;

interface DataType {
  key: string;
  id: number;
  caption: string;
  user: {
    name: string;
    email: string;
    avatarUrl: string;
  };
  createdAt: string;
  videos: any[];
}

const renderVideoStatus = (status: string, stage: string) => {
  const s = status.toUpperCase();
  const st = stage.toUpperCase();

  let colors = "bg-slate-50 text-slate-500 border-slate-200";

  if (s === STATUS.FAILED) {
    colors = "bg-rose-50 text-rose-600 border-rose-100";
  } else if (s === STATUS.PROCESSING) {
    colors = "bg-sky-50 text-sky-600 border-sky-100";
  } else if (st === STAGE.UPLOADING) {
    colors = "bg-blue-50 text-blue-600 border-blue-100";
  } else if (st === STAGE.EXTRACTING_FRAMES) {
    colors = "bg-cyan-50 text-cyan-600 border-cyan-100";
  } else if (st === STAGE.EXTRACTING_POSES) {
    colors = "bg-amber-50 text-amber-600 border-amber-100";
  } else if (st === STAGE.DRAWING_3D) {
    colors = "bg-green-50 text-green-600 border-green-100";
  }

  return (
    <span className={`uppercase inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${colors}`}>
      {displayStatus(status, stage)}
    </span>
  );
};

export default function ManagePost() {
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
      const res = await getAdminPosts({ page, pageSize });
      const items = res.items.map((item: any) => ({
        key: item.id.toString(),
        id: item.id,
        caption: item.caption,
        user: {
          name: item.user?.name || item.user?.username || 'Unknown',
          email: item.user?.email || '',
          avatarUrl: `https://ui-avatars.com/api/?name=${item.user?.name || 'User'}&background=random`,
        },
        createdAt: item.created_at,
        videos: item.videos || [],
      }));

      setData(items);
      setPagination(prev => ({ ...prev, current: page, total: res.total }));
    } catch (error) {
      console.error(error);
      message.error('Failed to load posts');
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

  const handleDelete = (postId: number) => {
    modal.confirm({
      title: t('pages.post.deleteConfirmTitle'),
      icon: <ExclamationCircleOutlined />,
      okText: t('common.ok'),
      okType: 'danger',
      cancelText: t("common.cancel"),
      onOk: async () => {
        try {
          await adminDeletePost(postId);
          messageApi.open({
            type: 'success',
            content: t('admin.managePost.deleteSuccess'),
          });
          fetchData(pagination.current, pagination.pageSize);
        } catch (error) {
          console.error(error);
          messageApi.open({
            type: 'error',
            content: t('admin.managePost.deleteError'),
          });
        }
      },
    });
  };

  const columns: ColumnsType<DataType> = [
    {
      title: t('admin.managePost.table.post'),
      dataIndex: 'caption',
      key: 'caption',
      width: '30%',
      ellipsis: true,
      render: (text, record) => (
        <div className="flex items-center gap-4">
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-normal text-slate-800 truncate">{text}</span>
            <span className="text-[10px] text-slate-400 font-light mt-0.5 tracking-wide">#{record.id}</span>
          </div>
        </div>
      ),
    },
    {
      title: t('admin.managePost.table.user'),
      dataIndex: 'user',
      key: 'user',
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-slate-100 overflow-hidden">
            <img alt="User avatar" className="w-full h-full object-cover" src={user.avatarUrl} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</span>
            <span className="text-[10px] text-slate-400">{user.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: t('admin.managePost.table.date'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => <span className="text-sm text-slate-400">{formatDate(text)}</span>,
    },
    {
      title: t('admin.managePost.table.actions'),
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<DeleteOutlined />}
            className="text-slate-400 hover:text-red-500"
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record: DataType) => {
    if (!record.videos || record.videos.length === 0) return null;

    return (
      <div className="ml-16 border-l-2 border-primary/20 flex flex-col divide-y divide-slate-100/50">
        {record.videos.map((video: any) => {
          const status = video.status || video.job?.status;
          const stage = video.stage || video.job?.stage;

          return (
            <div key={video.id} className="flex items-center justify-between py-2.5 pl-6 pr-6">
              <div className="flex items-center gap-3">
                <div className="aspect-video h-8 rounded bg-slate-200 overflow-hidden">
                  <img
                    alt={video.filename}
                    className="w-full h-full object-cover grayscale-[0.3]"
                    src={getAssetUrl(video.thumbnail_url || video.thumbnailUrl) || "https://placehold.co/100x56"}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-slate-600 uppercase tracking-tight">{video.name || `Camera ${video.id}`}</span>
                  <span className="text-[10px] text-slate-400 font-light">{video.filename}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-slate-400 uppercase font-light">{video.size}</span>
                {renderVideoStatus(status, stage)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {modalContextHolder}
      {messageContextHolder}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Title level={2} className="!mb-0 !font-light tracking-tight text-slate-900 dark:text-white">
            {t("admin.managePost.title")}
          </Title>
          <Text type="secondary" className="text-slate-500 text-sm">
            {t("admin.managePost.description")}
          </Text>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm mt-6">
        <Table
          loading={loading}
          columns={columns}
          dataSource={data}
          expandable={{
            expandedRowRender,
            rowExpandable: (record) => record?.videos ? record?.videos.length > 0 : false,
            expandIcon: ({ expanded, onExpand, record }) => (
              <div
                onClick={e => onExpand(record, e)}
                className="flex items-center justify-center border border-slate-200 rounded-sm size-4 cursor-pointer text-slate-400 hover:text-primary transition-colors inline-flex mr-2"
              >
                {expanded ? <DownOutlined style={{ fontSize: '10px' }} /> : <RightOutlined style={{ fontSize: '10px' }} />}
              </div>
            )
          }}
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