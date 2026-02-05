
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';
import {
  Button,
  message,
  Modal,
  Space,
  Table,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { STAGE, STATUS } from '../../constants';
import useAuth from '../../hooks/useAuth';
import { deletePosts, getPosts } from '../../services/postService';
import type { IPost } from '../../types';
import { displayStatus, formatDate } from '../../utils/util';
import { getAssetUrl } from '../../services';


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

export default function MyVideos() {
  const { t } = useTranslation();
  const [messageApi, msgContextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<IPost[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const columns: ColumnsType<IPost> = [
    {
      title: t('pages.myVideos.table.post'),
      dataIndex: 'caption',
      key: 'caption',
      width: '40%',
      ellipsis: true,
      render: (text, record) => (
        <div className="flex items-center gap-4">
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-normal text-slate-800 truncate">{text}</span>
            <span className="text-[10px] text-slate-400 font-light mt-0.5 tracking-wide">
              {record.viewMode === "single" ? "SINGLECAM_PROJECT_" : "MULTICAM_PROJECT_"}_{record.id}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: t('pages.myVideos.table.date'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => <span className="text-sm text-slate-400">{formatDate(text)}</span>,
    },
    {
      title: t('pages.myVideos.table.actions'),
      key: 'actions',
      align: 'right',
      render: (record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<DeleteOutlined />}
            color="danger"
            onClick={() => handleDeletePost([record.id])}
            className="text-red-300! hover:text-red-300! transition-colors"
          />
          <Button
            type="link"
            onClick={() => {
              console.log("record.id", record.id)
              navigate(`/posts/${record.id}`)
            }}
          >
            {t('pages.myVideos.viewPost')}
          </Button>
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record: IPost) => {
    if (!record.videos || record.videos.length === 0) return null;

    return (
      <div className="ml-16 border-l-2 border-primary/20 flex flex-col divide-y divide-slate-100/50">
        {record.videos.map((video: any) => (
          <div key={video.id} className="flex items-center justify-between py-2.5 pl-6 pr-6">
            <div className="flex items-center gap-3">
              <div className="aspect-video h-8 rounded bg-slate-200 overflow-hidden">
                <img
                  alt={video.name}
                  className="w-full h-full object-cover grayscale-[0.3]"
                  src={getAssetUrl(video.thumbnailUrl) || "https://placehold.co/100x56"}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-slate-600 uppercase tracking-tight">{video.name || `Camera ${video.id}`}</span>
                <span className="text-[10px] text-slate-400 font-light">{video.filename}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-slate-400 uppercase font-light">{video.size}</span>
              {renderVideoStatus(video.status, video.stage)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const fetchVideos = async () => {
    try {
      const data = await getPosts(user?.username);
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    user && fetchVideos();
  }, [user])

  const handleDeletePost = (ids: number[]) => {
    modal.confirm({
      title: t('pages.post.deleteConfirmTitle'),
      icon: <ExclamationCircleOutlined />,
      okText: t("common.ok"),
      cancelText: t("common.cancel"),
      onOk: async () => {
        try {
          await deletePosts(ids);
          messageApi.open({
            type: 'success',
            content: t('pages.post.message.delete_success'),
          })
          fetchVideos()
        } catch (error) {
          messageApi.open({
            type: 'error',
            content: t('pages.post.message.delete_error'),
          });
        }
      },
    });
  };

  return (
    <>
      {msgContextHolder}
      {modalContextHolder}
      <div className="w-full py-4 max-w-250 mx-auto font-display">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extralight text-slate-900 tracking-tight">{t('pages.myVideos.title')}</h1>
              <p className="text-slate-400 text-sm mt-1">{t('pages.myVideos.description')}</p>
            </div>
            <Button
              type="primary"
              disabled={selectedRowKeys.length === 0}
              onClick={() => handleDeletePost(selectedRowKeys)}
            >
              {t("common.delete")}
            </Button>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
          <Table
            columns={columns}
            dataSource={posts}
            rowKey="id"
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
            rowSelection={{
              selectedRowKeys,
              onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys as number[]),
            }}
            pagination={{
              position: ['bottomRight'],
              total: 42,
              showSizeChanger: false,
              itemRender: (_, type, originalElement) => {
                if (type === 'prev') {
                  return <button className="size-8 flex items-center justify-center border border-slate-100 rounded text-slate-400 hover:bg-slate-50 transition-colors bg-white"><LeftOutlined style={{ fontSize: '10px' }} /></button>;
                }
                if (type === 'next') {
                  return <button className="size-8 flex items-center justify-center border border-slate-100 rounded text-slate-400 hover:bg-slate-50 transition-colors bg-white"><RightOutlined style={{ fontSize: '10px' }} /></button>;
                }
                if (type === 'page') {
                  return originalElement;
                }
                return originalElement;
              },
              className: "px-6 py-4 border-t border-slate-50 m-0"
            }}
            rowClassName="hover:bg-slate-50/50 transition-colors"
          />
        </div>
      </div>
    </>
  );
}