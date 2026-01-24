import {
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Progress,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface DataType {
  key: string;
  userName: string;
  avatarUrl: string;
  email: string;
  role: 'Admin' | 'User';
  totalPosts: number;
  storageUsage: {
    used: number;
    total: number;
    percent: number;
  };
  lastActive: string;
}

const data: DataType[] = [
  {
    key: '1',
    userName: 'Alex Rivera',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAu_NfjEPaiPOJj2xetyMCwu_nthO09ypk3PltgaSjUzQZuDt2hGxTHEwSQt1mmVw76bbXYDdFXbRE5IwDLenRd4WGJPv_mhU3YNUqFIDATDZ-GBWFDmyxdDB0UuFOyfaeGISsCOSYdgmSjbHjWkeenPrZdAxxmlaFRcpXYfhsDF-IbRIkKsWl_FIgd-1QAZ95ThWZzdSXoV0EhZFq_pZ8MRUKdYMjXeLcUjf-I6LmLBqvJ7hj4DdY4GSiwuCUBxInbGnsCxixyV18',
    email: 'alex.rivera@example.com',
    role: 'Admin',
    totalPosts: 128,
    storageUsage: { used: 3.8, total: 5, percent: 76 },
    lastActive: '2 mins ago',
  },
  {
    key: '2',
    userName: 'Jordan Smith',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7J1CEDiMDipQDG8thvi80R5v1K5jk5CRGkboiv9LcIZxJlOfNs-C6kzzVOUWbaoFyBb1ZscU_p57-U4QFE2Y7PVCZ0JpFMozGc1xJKJ5QPgDRU5wSZUfLME3K1hfyphwPH3pJH8dyCrdIie0ux37tefiwaTH-WXTvPBD-IitBu7fIZ78NGeBgInqGsW3u6qlGSYMiQCgp0n3Yr09Ewtv4PATa50vsMDkfKb32jfVHDm2oSx1iiG8Bz5jZAobDQGZHk2RGrDP1TGA',
    email: 'j.smith@workspace.io',
    role: 'User',
    totalPosts: 45,
    storageUsage: { used: 1.2, total: 5, percent: 24 },
    lastActive: '1 hour ago',
  },
  {
    key: '3',
    userName: 'Casey Chen',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKvjPd90mTSAKgEAbO0ydRiy--hLf0Ai0pjERPvcRYKSp5_UrqzKjcQVA9qZ0Ir9uE9KmiVtoefQsmwn-BfEYSYDtRE8qptuDqN88DNZ7zRrqmhN0MIrBNh_kp7-QJkzCmBmhzuDSGsH7eKU8qIiHF8GUp8D66hX9yaeTv2SUoPgkGO-97LGq9DAmCR7SGb8FEYuB0EAvWQJQgdrKz1zC1Mt1P9L-5fT4UXU9nWyhI9u9A-Y2m0Fe1GFjdh5TL8OBrnrO0uUCcdJI',
    email: 'casey@design.co',
    role: 'User',
    totalPosts: 312,
    storageUsage: { used: 4.9, total: 5, percent: 98 },
    lastActive: 'Yesterday',
  },
  {
    key: '4',
    userName: 'Taylor Vane',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSqKjQP_29c7Ys_FiRxy0QcGby_WCKaDfkvEMG3kgLpbshaoZu13ftCrcfSBY5XO_cP-Aphfvnv-cYA4IC6D_JPUqbJbDgz9HIu5kd1hMr_F-6Kf7ElCIzNhVta6RAd2OZNqTK9SLbKEFa6OZ9Vr-OeAs1Jtj8_z2eq__p7nwu2F_dVzxVzUFpDQzPP2g0KNDlKN7d04buiFzMjPdEMAsrSHq1NjXkWrTibkDPCPucB_9hg-I99kyZWNengy-u24wO5xaidqd75CU',
    email: 'taylor.v@motion.ai',
    role: 'Admin',
    totalPosts: 12,
    storageUsage: { used: 0.4, total: 5, percent: 8 },
    lastActive: '5 days ago',
  },
];

const renderRoleTag = (role: string) => {
  if (role === 'Admin') {
    return (
      <Tag className="bg-info-pastel text-blue-700 border-none rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-tight">
        {role}
      </Tag>
    );
  }
  return (
    <Tag className="bg-success-pastel text-green-700 border-none rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-tight">
      {role}
    </Tag>
  );
};

const renderStorageProgress = (percent: number) => {
  // Determine color based on usage? The mock shows orange for high usage (98%) and primary for others.
  let strokeColor = "var(--color-primary)";
  if (percent > 90) {
    strokeColor = "#fdba74"; // orange-300 equivalent roughly or use custom color
  }

  return strokeColor;
}


const columns: ColumnsType<DataType> = [
  {
    title: 'USER NAME',
    dataIndex: 'userName',
    key: 'userName',
    render: (text, record) => (
      <div className="flex items-center gap-3">
        <Avatar src={record.avatarUrl} size={32} className="bg-slate-100" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{text}</span>
      </div>
    ),
  },
  {
    title: 'EMAIL',
    dataIndex: 'email',
    key: 'email',
    render: (text) => <span className="text-sm text-slate-500">{text}</span>,
  },
  {
    title: 'ROLE',
    dataIndex: 'role',
    key: 'role',
    render: (role) => renderRoleTag(role),
  },
  {
    title: 'TOTAL POSTS',
    dataIndex: 'totalPosts',
    key: 'totalPosts',
    render: (count) => (
      <span className="text-sm text-slate-600 dark:text-slate-400 font-light">{count}</span>
    ),
  },
  {
    title: 'STORAGE USAGE',
    dataIndex: 'storageUsage',
    key: 'storageUsage',
    width: 200,
    render: (storageValue: { used: number; total: number; percent: number }) => (
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] text-slate-400">
          <span>
            {storageValue.used}GB / {storageValue.total}GB
          </span>
        </div>
        <Progress
          percent={storageValue.percent}
          showInfo={false}
          strokeColor={storageValue.percent > 90 ? "#fdba74" : "var(--color-primary)"}
          trailColor="#f1f5f9"
          size="small"
          className="m-0"
        />
      </div>
    ),
  },
  {
    title: 'LAST ACTIVE',
    dataIndex: 'lastActive',
    key: 'lastActive',
    render: (text) => <span className="text-xs text-slate-500">{text}</span>,
  },
  {
    title: 'ACTIONS',
    key: 'actions',
    align: 'right',
    render: () => (
      <Space size="small">
        <Button
          type="text"
          icon={<EditOutlined />}
          className="text-slate-400 hover:text-primary"
          title="Edit"
        />
        <Button
          type="text"
          icon={<KeyOutlined />}
          className="text-slate-400 hover:text-primary"
          title="Manage Keys"
        />
        <Button
          type="text"
          icon={<UserDeleteOutlined />} // using UserDeleteOutlined as roughly equivalent to person_off
          className="text-slate-400 hover:text-red-400"
          title="Deactivate"
        />
      </Space>
    ),
  },
];

export default function ManageUser() {
  return (
    <>
      <div className="flex flex-col gap-1">
        <Title level={2} className="!mb-0 !font-light tracking-tight text-slate-900 dark:text-white">
          Manage Users
        </Title>
        <Text type="secondary" className="text-slate-500 text-sm">
          Review user activity, storage quotas, and access permissions.
        </Text>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <Table
          columns={columns}
          dataSource={data}
          pagination={{
            position: ['bottomRight'],
            total: 1240,
            showSizeChanger: false,
            itemRender: (page, type, originalElement) => {
              if (type === 'prev') {
                return <a className="px-3 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded hover:bg-white transition-colors text-black">Previous</a>;
              }
              if (type === 'next') {
                return <a className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90 transition-colors">Next</a>;
              }
              return originalElement;
            }
          }}
          rowClassName="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
        />
      </div>
    </>
  );
}
