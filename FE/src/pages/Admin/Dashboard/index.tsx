
import {
  RightOutlined,
  TeamOutlined,
  KeyOutlined,
  AreaChartOutlined,
  CheckCircleOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import {
  Button,
  Tag,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAdminStats } from '../../../services/adminService';


const { Title, Text } = Typography;

export default function Dashboard({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { t } = useTranslation();
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    activeAPIKeys: 0,
    activeJobs: 0,
  });

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await getAdminStats();
        setAdminStats(response.data);
        console.log(response)
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    };
    fetchAdminStats();
  }, [])



  const stats = [
    {
      title: 'Total Users',
      value: '12,482',
      change: '+12.5%',
      isPositive: true,
      icon: <TeamOutlined className="text-primary text-xl" />,
      chartData: [30, 45, 35, 60, 50, 80, 90], // mock data for bars
    },
    {
      title: 'Active API Keys',
      value: '843',
      change: '+4.2%',
      isPositive: true,
      icon: <KeyOutlined className="text-primary text-xl" />,
      chartData: [40, 30, 55, 45, 70, 60, 75],
    },
    {
      title: 'Active Jobs',
      value: '156',
      status: 'Normal load (84% capacity)',
      icon: <AreaChartOutlined className="text-primary text-xl" />,
      chartData: [60, 50, 75, 65, 85, 80, 95],
    },
  ];

  const activeUsers = [
    {
      name: 'Alex Rivera',
      activity: 'active 2m ago',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSXhNLMO1uME5GrEYrFqNZfwxXrUi18vdBUxHli3duTtUc1qr-VjXqqiUCkj7DQDry3kxmrEjxcjEBV_gyHjmf-SP-tsI4plcHeHYTgA0hhb8fx9RJvamTFqwlOum3QEFOTILQT3I6MC9-eb9kaCh5-vH6sHmCu3E7p1kdCGzS2Z29KMrJgoi3fKqX2L0iPNW2E0k_PDzGUk_kDFnVXfoTOgaXEC1_ckqDO0tatbbqc44XnhrwVtDgzFuTL8RsDt5fKEoPjnxuFiI',
      tag: 'API Access',
      tagColor: 'blue',
    },
    {
      name: 'Jordan Smith',
      activity: 'active 15m ago',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5TYZbBd0k8MX3S7zhw5obZczWjNK9bFBhjNvKsrKoA0nz1EsD_hKeyZV0d_kNR54LsK2HI8vIhIuX5oFr-2RgMa97wFPaABwUyyn2Nq7Z8RC7LHLm6tQwlG_ohOgvtUHWTBut-IGnUKyOMzdLq3Qj7CFCo3piX9ObN6kbEIpi4FKVKdG2uSphSpToVyAT7rMXK0cVFhoqQ-VxOvZNISiNlhcAv6-TWhkv-jZbb9MKtyjGTNQ5WbXOP4rY05DIddoAzwKe_dzcjsE',
      tag: 'Web Dashboard',
      tagColor: 'green',
    },
    {
      name: 'Sarah Chen',
      activity: 'active 45m ago',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnKz60wz61W20knOE0LeFvpXU4K0tMNOzSA40CJhtXBGfpHlieOH3wp9nQA1ZGU3VU2UM5F2LS3NDLISz1VYQdgaA2K8fL5TLRnSE-7hIrWTEpYFve7XayVxDyBrlw9Al0uiQXDUyvdcinlJDBmqAHu9FIIPrknSktmyLQc0ohvtgO8RUGo60SSGmlx21W1ZiCTNMiDVOgsVBJCkwNIxVZcyta8PIofTT_-zqsuVFi0xYqPEchbHSKp4A-f779WfUkmR3lChPYlvc',
      tag: 'API Access',
      tagColor: 'blue',
    },
  ];

  const recentJobs = [
    {
      name: 'MOCAP_Sequence_042.mp4',
      id: 'job-88219 • 4m ago',
      progress: 65,
      status: 'Extracting Pose',
      statusColor: 'blue',
    },
    {
      name: 'Studio_Run_Cycle.fbx',
      id: 'job-88218 • 12m ago',
      progress: 85,
      status: 'Drawing Mesh',
      statusColor: 'gold',
    },
    {
      name: 'Dance_Performance_Full.mp4',
      id: 'job-88217 • 24m ago',
      progress: 100,
      status: 'Complete',
      statusColor: 'green',
    },
    {
      name: 'Interaction_Test_02.mp4',
      id: 'job-88216 • 38m ago',
      progress: 100,
      status: 'Complete',
      statusColor: 'green',
    },
    {
      name: 'Crowd_Simulation_09.fbx',
      id: 'job-88215 • 52m ago',
      progress: 35,
      status: 'Extracting Pose',
      statusColor: 'blue',
    },
  ];


  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <Title level={2} className="!mb-0 !font-light tracking-tight text-slate-900 dark:text-white">
          Statistics Overview
        </Title>
        <Text type="secondary" className="text-slate-500 text-sm font-light">
          Real-time performance metrics and system health indicators.
        </Text>
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
            <div className="flex items-center gap-1 text-[10px] font-medium">
              {stat.change && (
                <>
                  <ArrowUpOutlined className="text-green-500" />
                  <span className="text-green-500">{stat.change} from last month</span>
                </>
              )}
              {stat.status && (
                <span className="text-slate-400">{stat.status}</span>
              )}
            </div>
          </div>
        ))}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Active Users */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white m-0">Recent Active Users</h4>
            <Button
              type="link"
              className="text-primary text-xs font-medium p-0 h-auto hover:underline"
              onClick={() => setActiveTab("users")}
            >
              View All
            </Button>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {activeUsers.map((user, idx) => (
              <div key={idx} className="px-6 py-4 flex items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-slate-100 overflow-hidden ring-2 ring-white dark:ring-slate-800">
                    <img alt="Avatar" className="w-full h-full object-cover" src={user.avatar} />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-slate-900 dark:text-white m-0">{user.name}</p>
                    <p className="text-[10px] text-slate-400 m-0">{user.activity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className={`px-2 py-0.5 rounded-full text-[10px] font-medium border m-0 ${user.tagColor === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'
                    }`}>
                    {user.tag}
                  </Tag>
                  <RightOutlined className="text-slate-300 group-hover:text-primary transition-colors text-xs" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white m-0">Recent Jobs</h4>
            <Button type="link" className="text-primary text-xs font-medium p-0 h-auto hover:underline" onClick={() => setActiveTab("job_monitoring")}>View All</Button>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {recentJobs.map((job, idx) => (
              <div key={idx} className="px-6 py-4 flex items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="relative size-10 flex items-center justify-center">
                    {job.progress === 100 ? (
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
                          <circle className="text-primary" cx="20" cy="20" fill="transparent" r="16" stroke="currentColor" strokeDasharray="100" strokeDashoffset={100 - job.progress} strokeWidth="2.5"></circle>
                        </svg>
                        <span className="text-[10px] font-medium text-slate-500">{job.progress}%</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-slate-900 dark:text-white m-0">{job.name}</p>
                    <p className="text-[10px] text-slate-400 m-0">{job.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className={`px-2 py-0.5 rounded-full text-[10px] font-medium border m-0 ${job.statusColor === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    job.statusColor === 'green' ? 'bg-green-50 text-green-600 border-green-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                    {job.status}
                  </Tag>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
