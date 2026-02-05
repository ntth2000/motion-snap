import {
  AreaChartOutlined,
  CheckCircleOutlined,
  KeyOutlined,
  RightOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  Button,
  Tag,
  Typography,
} from 'antd';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import AvatarUI from '../../../components/UI/Avatar';
import { getAdminStats } from '../../../services/adminService';

const { Title, Text } = Typography;

interface DashboardStats {
  total_users: number;
  total_api_keys: number;
  total_posts: number;
  total_jobs: number;
  pending_jobs: number;
  processing_jobs: number;
  failed_jobs: number;
  completed_jobs: number;
  success_rate: number;
  recent_users: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    created_at: string;
    username: string;
  }[];
  recent_jobs: {
    id: number;
    video_filename: string;
    created_at: string;
    status: string;
    progress: number;
    user_email: string;
  }[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [adminStats, setAdminStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const data = await getAdminStats();
        setAdminStats(data);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    };
    fetchAdminStats();
  }, [])

  const stats = [
    {
      title: t('admin.dashboard.stats.totalUsers'),
      value: adminStats?.total_users?.toLocaleString() || '0',
      change: '+12.5%', // Mock
      isPositive: true,
      icon: <TeamOutlined className="text-primary text-xl" />,
      chartData: [30, 45, 35, 60, 50, 80, 90], // mock data for bars
    },
    {
      title: t('admin.dashboard.stats.totalApiKeys'),
      value: adminStats?.total_api_keys?.toLocaleString() || '0',
      change: '+4.2%', // Mock
      isPositive: true,
      icon: <KeyOutlined className="text-primary text-xl" />,
      chartData: [40, 30, 55, 45, 70, 60, 75],
    },
    {
      title: t('admin.dashboard.stats.totalJobs'),
      value: adminStats?.total_jobs?.toLocaleString() || '0',
      status: `Success Rate: ${adminStats?.success_rate || 0}%`,
      icon: <AreaChartOutlined className="text-primary text-xl" />,
      chartData: [60, 50, 75, 65, 85, 80, 95],
    },
  ];

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'green';
      case 'FAILED': return 'red';
      case 'PROCESSING': return 'blue';
      default: return 'gold';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <Title level={2} className="!mb-0 !font-light tracking-tight text-slate-900 dark:text-white">
          {t('admin.dashboard.overview')}
        </Title>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.title}</span>
              {stat.icon}
            </div>
            <div className="flex items-end justify-between">
              <h3 className="text-4xl font-extralight text-slate-900 dark:text-white mb-0">{stat.value}</h3>
              <div className="w-24 h-8 flex items-end gap-0.5 pb-1">
                {stat.chartData.map((h, i) => (
                  <div key={i} className="w-1 bg-primary rounded-full transition-all duration-500" style={{ height: `${h}%`, opacity: (i + 3) / 10 }}></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Active Users */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white m-0">{t('admin.dashboard.recentUsers.title')}</h4>
            <Button
              type="link"
              className="text-primary text-xs font-medium p-0 h-auto hover:underline"
              onClick={() => navigate("/admin/users")}
            >
              {t('admin.dashboard.recentUsers.viewAll')}
            </Button>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {adminStats?.recent_users?.map((user, idx) => (
              <div
                onClick={() => navigate(`/profile/${user?.username}`)}
                key={idx} className="px-6 py-4 flex items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="rounded-full border border-slate-100 overflow-hidden">
                    <AvatarUI name={user.name} />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-slate-900 dark:text-white m-0">{user.name}</p>
                    <p className="text-[10px] text-slate-400 m-0">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-slate-400 m-0">{formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</p>
                  <RightOutlined className="text-slate-300 group-hover:text-primary transition-colors text-xs" />
                </div>
              </div>
            ))}
            {(!adminStats?.recent_users || adminStats.recent_users.length === 0) && (
              <div className="p-6 text-center text-slate-400 text-sm">{t('admin.dashboard.recentUsers.noUsers')}</div>
            )}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white m-0">{t('admin.dashboard.recentJobs.title')}</h4>
            <Button type="link" className="text-primary text-xs font-medium p-0 h-auto hover:underline" onClick={() => navigate("/admin/posts")}>{t('admin.dashboard.recentJobs.viewAll')}</Button>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {adminStats?.recent_jobs?.map((job, idx) => {
              const color = getJobStatusColor(job.status);
              return (
                <div key={idx} className="px-6 py-4 flex items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="relative size-10 flex items-center justify-center">
                      {job.progress === 100 || job.status === 'COMPLETED' ? (
                        <div className="relative size-10 flex items-center justify-center">
                          <svg className="size-10 absolute -rotate-90">
                            <circle className="text-slate-100 dark:text-slate-800" cx="20" cy="20" fill="transparent" r="16" stroke="currentColor" strokeWidth="2.5"></circle>
                            <circle className="text-green-400" cx="20" cy="20" fill="transparent" r="16" stroke="currentColor" strokeDasharray="100" strokeDashoffset="0" strokeWidth="2.5"></circle>
                          </svg>
                          <CheckCircleOutlined className="text-green-500 text-sm" />
                        </div>
                      ) : (
                        <div className="relative size-10 flex items-center justify-center">
                          <svg className="size-10 absolute -rotate-90">
                            <circle className="text-slate-100 dark:text-slate-800" cx="20" cy="20" fill="transparent" r="16" stroke="currentColor" strokeWidth="2.5"></circle>
                            <circle className="text-primary" cx="20" cy="20" fill="transparent" r="16" stroke="currentColor" strokeDasharray="100" strokeDashoffset={100 - (job.progress || 0)} strokeWidth="2.5"></circle>
                          </svg>
                          <span className="text-[10px] font-medium text-slate-500">{job.progress}%</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-slate-900 dark:text-white m-0 truncate max-w-[150px]">{job.video_filename}</p>
                      <p className="text-[10px] text-slate-400 m-0">Job #{job.id} • {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className={`px-2 py-0.5 rounded-full text-[10px] font-medium border m-0 
                    ${color === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        color === 'green' ? 'bg-green-50 text-green-600 border-green-100' :
                          color === 'red' ? 'bg-red-50 text-red-600 border-red-100' :
                            'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                      {job.status}
                    </Tag>
                  </div>
                </div>
              )
            })}
            {(!adminStats?.recent_jobs || adminStats.recent_jobs.length === 0) && (
              <div className="p-6 text-center text-slate-400 text-sm">{t('admin.dashboard.recentJobs.noJobs')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
