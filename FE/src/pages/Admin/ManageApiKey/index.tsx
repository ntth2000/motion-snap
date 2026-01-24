
import {
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

interface DataType {
  key: string;
  owner: {
    name: string;
    role: string;
    avatarUrl: string;
  };
  maskedKey: string;
  status: 'active' | 'revoked';
  usage: {
    requests: number;
    percent: number;
  };
}

const data: DataType[] = [
  {
    key: '1',
    owner: {
      name: 'Alex Rivera',
      role: 'Pro Developer',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSjkvTE9LOcYUDf7xX7BokfQKFJTNcQE8BcpvxtY9feIYFihXcTvOw6SvXxYyVijEP5e60CxzJkBRMfGnvjZeWACmJiOI4rH-b0gqHU-3dPsfuXMC7GnGa15-eJ9t9mYp6cAipWQOucVNc2EzVLbWUwsCQnreXIeI2gz7t8sm0rIAUm8Y4pL6elKzeVczYgUhDovKKxMz2tiPqnyNuzk1ipEWBdcOv4hmbXLSMXxE4a2a4k8rgcrkFaHPgrcx7Bxx7-Fle9v_h6yo',
    },
    maskedKey: 'sk-Proj...9f8z',
    status: 'active',
    usage: { requests: 1240, percent: 65 },
  },
  {
    key: '2',
    owner: {
      name: 'Jordan Smith',
      role: 'Individual',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdIzwOUu4oAtpjD5CQx1nXVoG4BfceWrD9R44KaaCK4ojIRVuS1RZoJCMaCLkif_ySCmiR45l0ZJ33eSEbh1tvVGEC8GuQ4t4iaSepTc_jecEBXfZn3yIz_NdZ6CutczcbBWiT1r813fGvejnVH-R8w3xYH8ozIEjmm9o0Cv8V_R86xWBm7ZN2FW4XTrRP5aBwVzcurzSElcIN0rglU1nADqosAbKX7FpVbaU29zNJblYzeHrYMEHUgHam-NXeqjtth5Di5rrofTE',
    },
    maskedKey: 'sk-Proj...4x2l',
    status: 'active',
    usage: { requests: 452, percent: 20 },
  },
  {
    key: '3',
    owner: {
      name: 'Casey Chen',
      role: 'Enterprise',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASs0qt3UzspR9hTzE114lqdPtgjsyysqngeYOaWIGVXEU67S-3NhYPVvVfJQXb9qsQ0WCDmkOVRffq2hU1WZeocf1YfOiNeoso6wakxeXWLfIKPggQZ3beQZRBrD6_epYoeBeqBKUJSw7qkAn03LpFFSc_xXw_Q9iWBd4hNSI43hWstj-ld62tEov_dz0TzijClFwNHd5FvpbPGl6ZP2KUYCo9SfYcsPeglhyJ37zEuPD4M9bPTHBpXQ_h25jodBiV8vvfekR9VvU',
    },
    maskedKey: 'sk-Proj...1b9v',
    status: 'revoked',
    usage: { requests: 0, percent: 0 },
  },
  {
    key: '4',
    owner: {
      name: 'Taylor Vane',
      role: 'Pro Developer',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCu2gdcK4WDVRoN7M1qaYBolMwSzE7VcCiz0fx-r-BtKcDKk08pzJkUNQqzmZApSGJdOl0QdsqDfNtV89QyR9Xnhl1w_pwJnaXGGGRM8AmTM4v-0aKsRcEDzbTmt70-47MlyrXnwtrn8YPetsyJAYIY5WXYdhsWpoG0cqbdZeRMn__mCj-yYNvyHLIFsMI32uX2E4BgILmrw0mXG5MS3zJNYUVdPbnZrXPR1zUlzHsVxJY23cHQH5OdfsIRQ0M0AfHUaSOw1p9d5ZI',
    },
    maskedKey: 'sk-Proj...7m3q',
    status: 'active',
    usage: { requests: 2891, percent: 90 },
  },
];

const renderStatusTag = (status: 'active' | 'revoked') => {
  if (status === 'active') {
    return (
      <Tag className="bg-success-pastel text-[#15803d] border-none rounded-full px-2.5 py-0.5 text-xs font-medium">
        ACTIVE
      </Tag>
    );
  }
  return (
    <Tag className="bg-error-pastel text-[#b91c1c] border-none rounded-full px-2.5 py-0.5 text-xs font-medium">
      REVOKED
    </Tag>
  );
};

const columns: ColumnsType<DataType> = [
  {
    title: 'OWNER',
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
    title: 'MASKED KEY',
    dataIndex: 'maskedKey',
    key: 'maskedKey',
    render: (text) => (
      <code className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded">
        {text}
      </code>
    ),
  },
  {
    title: 'STATUS',
    dataIndex: 'status',
    key: 'status',
    render: (status) => renderStatusTag(status),
  },
  {
    title: 'USAGE (24H)',
    dataIndex: 'usage',
    key: 'usage',
    width: 250,
    render: (usage: { requests: number; percent: number }) => (
      <div className="flex flex-col">
        <span className="text-sm text-slate-700 dark:text-slate-300">
          {usage.requests.toLocaleString()} requests
        </span>
        <div className="w-24 bg-slate-100 dark:bg-slate-800 h-1 rounded-full mt-1">
          <div
            className={`h-1 rounded-full ${usage.percent === 0 ? 'bg-slate-200' : 'bg-primary'}`}
            style={{ width: `${usage.percent}%` }}
          ></div>
        </div>
      </div>
    ),
  },
  {
    title: 'ACTIONS',
    key: 'actions',
    align: 'right',
    render: (_, record) => (
      record.status === 'active' ? (
        <button className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors px-3 py-1.5 border border-red-100 hover:border-red-200 rounded-lg bg-transparent cursor-pointer">
          Revoke Key
        </button>
      ) : (
        <button className="text-xs font-medium text-slate-400 cursor-not-allowed px-3 py-1.5 border border-slate-100 rounded-lg bg-transparent" disabled>
          Revoked
        </button>
      )
    ),
  },
];

export default function ManageApiKey() {
  const { t } = useTranslation();
  return (
    <>
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
          columns={columns}
          dataSource={data}
          pagination={{
            position: ['bottomRight'],
            total: 12, // From HTML: "Showing 4 of 12 keys" - mocking total
            showSizeChanger: false,
            itemRender: (_, type) => {
              if (type === 'prev') {
                return <button className="px-3 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded hover:bg-white transition-colors bg-white cursor-pointer">Previous</button>;
              }
              if (type === 'next') {
                return <button className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90 transition-colors border-none cursor-pointer">Next</button>;
              }
              return null; // The HTML only showed Previous/Next buttons, typically AntD shows numbers too. I'll hide numbers to match specific look or let AntD be AntD? 
              // The HTML design shows "Showing 4 of 12 keys" on left and "Previous" "Next" buttons on right.
              // AntD Table builds this bar differently. 
              // To match EXACTLY, I might need custom footer. But for now itemRender is close enough for buttons.
              // Wait, removing numbers entirely might communicate "no pages".
              // Let's sticking to simple AntD defaults for numbers to keep it functional, but style the buttons if possible.
              // Actually the user's HTML shows NO numbers.
            }
          }}
          rowClassName="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
        />
      </div>
    </>
  );
}
