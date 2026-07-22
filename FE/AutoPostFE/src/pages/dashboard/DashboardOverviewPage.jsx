import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Progress, Table, Tag, Button } from 'antd';
import { Share2, FileText, Clock, Crown, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import postApi from '../../api/postApi';
import accountApi from '../../api/accountApi';
import dayjs from 'dayjs';

const DashboardOverviewPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    accountsCount: 0,
    monthPostsCount: 0,
    scheduledCount: 0
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const fetchPosts = postApi.getPosts({ limit: 5 }).catch(err => ({ data: [] }));
        const fetchAccounts = accountApi.getAccounts().catch(err => ({ data: [] }));
        
        const [postsRes, accountsRes] = await Promise.all([fetchPosts, fetchAccounts]);
        
        const posts = postsRes.data || [];
        const accounts = accountsRes.data || [];
        
        // Mocking some stats logic since BE might not provide exact aggregates in /posts endpoint
        setStats({
          accountsCount: accounts.length,
          monthPostsCount: posts.filter(p => p.status === 'published').length, // mock
          scheduledCount: posts.filter(p => p.status === 'scheduled').length
        });
        
        setRecentPosts(posts.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const getStatusTag = (status) => {
    switch(status) {
      case 'published': return <Tag color="success">Đã đăng</Tag>;
      case 'scheduled': return <Tag color="processing">Đã lên lịch</Tag>;
      case 'failed': return <Tag color="error">Lỗi</Tag>;
      default: return <Tag color="default">Nháp</Tag>;
    }
  };

  const columns = [
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      render: (text) => <div className="truncate max-w-xs">{text}</div>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
    }
  ];

  const StatCard = ({ title, value, limit, icon: Icon, colorClass }) => (
    <Card className="h-full rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900/50 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {value} {limit && <span className="text-sm font-normal text-slate-400">/ {limit}</span>}
          </h3>
        </div>
        <div className={`p-3 rounded-lg ${colorClass}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      {limit && (
        <Progress 
          percent={Math.round((value / limit) * 100)} 
          showInfo={false} 
          className="mt-4 mb-0" 
          size="small"
        />
      )}
    </Card>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Tổng quan Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">Chào mừng trở lại, {user?.name}!</p>
      </div>

      {user?.plan === 'free' && (
        <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <h4 className="text-amber-800 dark:text-amber-400 font-semibold flex items-center gap-2">
              <Crown className="w-4 h-4" /> Bạn đang sử dụng gói Free
            </h4>
            <p className="text-amber-700/80 dark:text-amber-500/80 text-sm mt-1">
              Nâng cấp lên PRO để bỏ giới hạn 30 bài/tháng và mở khóa tính năng đăng ảnh/video!
            </p>
          </div>
          <Button type="primary" className="bg-amber-500 hover:bg-amber-600 border-none">
            Nâng Cấp Ngay
          </Button>
        </div>
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard 
            title="Tài khoản MXH" 
            value={stats.accountsCount} 
            limit={user?.plan === 'free' ? 3 : null} 
            icon={Share2}
            colorClass="bg-blue-500 shadow-blue-500/30"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard 
            title="Bài đã đăng tháng này" 
            value={stats.monthPostsCount} 
            limit={user?.plan === 'free' ? 30 : null} 
            icon={FileText}
            colorClass="bg-emerald-500 shadow-emerald-500/30"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard 
            title="Bài chờ phát (Queue)" 
            value={stats.scheduledCount} 
            limit={user?.plan === 'free' ? 3 : null}
            icon={Clock}
            colorClass="bg-amber-500 shadow-amber-500/30"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard 
            title="Gói Dịch Vụ" 
            value={user?.plan?.toUpperCase()} 
            icon={Crown}
            colorClass="bg-violet-500 shadow-violet-500/30"
          />
        </Col>
      </Row>

      <Card 
        title={<span className="font-semibold dark:text-white">Bài viết gần đây</span>} 
        extra={<Button type="link" className="flex items-center gap-1">Xem tất cả <ArrowRight className="w-4 h-4" /></Button>}
        className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900/50 shadow-sm custom-card-header"
      >
        <Table 
          dataSource={recentPosts} 
          columns={columns} 
          rowKey="_id" 
          pagination={false} 
          loading={loading}
          className="custom-table"
        />
      </Card>
    </div>
  );
};

export default DashboardOverviewPage;
