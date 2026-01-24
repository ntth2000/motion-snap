import { Table, Typography } from "antd";
import {
  BellOutlined,
  DeleteOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import {
  Button,
  Progress,
  Space,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
const { Title, Text } = Typography;

interface DataType {
  key: string;
  postId: string;
  userName: string;
  cam01: 'Extracted' | 'Uploading';
  cam02: 'Extracted' | 'Uploading';
  aiProcessing: number;
}

const data: DataType[] = [
  {
    key: '1',
    postId: '#MC-9021',
    userName: 'Alex Rivera',
    cam01: 'Extracted',
    cam02: 'Extracted',
    aiProcessing: 75,
  },
  {
    key: '2',
    postId: '#MC-9022',
    userName: 'Jordan Smith',
    cam01: 'Extracted',
    cam02: 'Uploading',
    aiProcessing: 40,
  },
  {
    key: '3',
    postId: '#MC-9023',
    userName: 'Casey Chen',
    cam01: 'Uploading',
    cam02: 'Uploading',
    aiProcessing: 15,
  },
  {
    key: '4',
    postId: '#MC-9024',
    userName: 'Taylor Vane',
    cam01: 'Extracted',
    cam02: 'Extracted',
    aiProcessing: 100,
  },
];
const renderStatusParams = (status: string) => {
  if (status === 'Extracted') {
    return 'bg-success-pastel text-green-700';
  }
  return 'bg-info-pastel text-blue-700';
};
export default function ManagePost({ }) {
  const columns: ColumnsType<DataType> = [
    {
      title: 'POST ID',
      dataIndex: 'postId',
      key: 'postId',
      render: (text) => <span className="text-primary font-medium">{text}</span>,
    },
    {
      title: 'USER NAME',
      dataIndex: 'userName',
      key: 'userName',
      render: (text) => <span className="text-slate-700 dark:text-slate-300">{text}</span>,
    },
    {
      title: 'CAM 01',
      dataIndex: 'cam01',
      key: 'cam01',
      render: (status) => {
        const className = renderStatusParams(status);
        return (
          <Tag
            className={`border-none rounded-full px-2.5 py-0.5 font-medium ${className}`}
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'CAM 02',
      dataIndex: 'cam02',
      key: 'cam02',
      render: (status) => {
        const className = renderStatusParams(status);
        return (
          <Tag
            className={`border-none rounded-full px-2.5 py-0.5 font-medium ${className}`}
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'AI PROCESSING',
      dataIndex: 'aiProcessing',
      key: 'aiProcessing',
      width: 200,
      render: (percent) => (
        <div className="pr-6">
          <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
            <span>{percent}%</span>
          </div>
          <Progress
            percent={percent}
            showInfo={false}
            strokeColor="var(--color-primary)"
            trailColor="#f1f5f9"
            size="small"
          />
        </div>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      align: 'right',
      render: () => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeInvisibleOutlined />}
            className="text-slate-400 hover:text-primary"
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            className="text-slate-400 hover:text-red-400"
          />
          <Button
            type="text"
            icon={<BellOutlined />}
            className="text-slate-400 hover:text-primary"
          />
        </Space>
      ),
    },
  ];
  return (
    <>
      <div className="flex flex-col gap-1">
        <Title level={2} className="!mb-0 !font-light tracking-tight text-slate-900">
          Manage Posts
        </Title>
        <Text type="secondary" className="text-slate-500">
          Monitor camera status and AI processing for all user uploads.
        </Text>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
        <Table
          columns={columns}
          dataSource={data}
          pagination={{ position: ['bottomRight'] }}
          rowClassName="hover:bg-slate-50 transition-colors"
        />
      </div>
    </>
  );
}