import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Input, DatePicker, Select, Popconfirm, message, Drawer, Space, Alert } from 'antd';
import { Eye, Edit2, Trash2, Search, CheckCircle2, XCircle, Share2, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import postApi from '../../api/postApi';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const PostsListPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [logDrawerOpen, setLogDrawerOpen] = useState(false);
  const [selectedPostLogs, setSelectedPostLogs] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await postApi.getPosts();
      setPosts(res.data || []);
    } catch (error) {
      if (error.message?.includes('404')) {
        setPosts([]);
      } else {
        message.error('Lỗi khi tải danh sách bài viết');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await postApi.deletePost(id);
      message.success('Đã xóa bài viết');
      fetchPosts();
    } catch (error) {
      message.error('Lỗi khi xóa bài viết');
    }
  };

  const showLogs = async (post) => {
    try {
      const res = await postApi.getPostById(post._id);
      setSelectedPostLogs(res.data?.logs || []);
      setSelectedPostId(post._id);
      setLogDrawerOpen(true);
    } catch (error) {
      message.error('Không thể lấy chi tiết log');
    }
  };

  const getStatusTag = (status) => {
    switch(status) {
      case 'published': return <Tag color="success" className="px-3 py-1 rounded-full text-xs font-bold border-none uppercase">Đã đăng</Tag>;
      case 'scheduled': return <Tag color="processing" className="px-3 py-1 rounded-full text-xs font-bold border-none uppercase">Đã lên lịch</Tag>;
      case 'processing': return <Tag color="warning" className="px-3 py-1 rounded-full text-xs font-bold border-none uppercase">Đang xử lý</Tag>;
      case 'failed': return <Tag color="error" className="px-3 py-1 rounded-full text-xs font-bold border-none uppercase">Lỗi</Tag>;
      default: return <Tag color="default" className="px-3 py-1 rounded-full text-xs font-bold border-none uppercase">Nháp</Tag>;
    }
  };

  const columns = [
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      render: (text, record) => (
        <div className="max-w-xs">
          <div className="truncate font-medium text-slate-800 dark:text-slate-200">{text}</div>
          {record.mediaUrls?.length > 0 && (
            <div className="text-xs text-indigo-500 mt-1">📸 {record.mediaUrls.length} file đính kèm</div>
          )}
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Thời gian đăng',
      dataIndex: 'scheduledAt',
      key: 'scheduledAt',
      render: (date, record) => (
        <div>
          <div className="font-medium">{date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'Đăng ngay'}</div>
          <div className="text-xs text-slate-400">Tạo lúc: {dayjs(record.createdAt).format('DD/MM')}</div>
        </div>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {(record.status === 'published' || record.status === 'failed' || record.status === 'processing') && (
            <Button type="text" onClick={() => showLogs(record)} icon={<Eye className="w-4 h-4 text-indigo-500" />}>
              Logs
            </Button>
          )}
          
          {(record.status === 'draft' || record.status === 'scheduled') && (
            <Link to={`/posts/edit/${record._id}`}>
              <Button type="text" icon={<Edit2 className="w-4 h-4 text-amber-500" />}>Sửa</Button>
            </Link>
          )}

          <Popconfirm
            title="Xóa bài viết?"
            description="Lịch hẹn giờ cũng sẽ bị hủy."
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<Trash2 className="w-4 h-4" />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const getPlatformIcon = (platform) => {
    if (platform === 'telegram') return <Send className="w-5 h-5 text-blue-500" />;
    return <Share2 className="w-5 h-5 text-indigo-500" />;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Lịch sử bài đăng</h1>
          <p className="text-slate-500 dark:text-slate-400">Quản lý các bài viết đã lên lịch và xem kết quả phát bài</p>
        </div>
        <Link to="/posts/create">
          <Button type="primary" className="bg-indigo-600 hover:bg-indigo-700 h-10 px-6 rounded-lg shadow-indigo-500/30">
            Tạo Bài Mới
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-4">
        <Input 
          placeholder="Tìm kiếm nội dung..." 
          prefix={<Search className="w-4 h-4 text-slate-400" />}
          className="max-w-xs rounded-lg"
        />
        <Select defaultValue="all" className="w-32 rounded-lg" options={[
          { value: 'all', label: 'Tất cả trạng thái' },
          { value: 'scheduled', label: 'Đã lên lịch' },
          { value: 'published', label: 'Đã đăng' },
          { value: 'failed', label: 'Lỗi' },
        ]} />
        <RangePicker className="rounded-lg" />
      </div>

      <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={posts} 
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          className="custom-table"
        />
      </div>

      <Drawer
        title={<span className="font-bold">Log Chi Tiết Bài Đăng #{selectedPostId?.slice(-6)}</span>}
        placement="right"
        width={450}
        onClose={() => setLogDrawerOpen(false)}
        open={logDrawerOpen}
        bodyStyle={{ padding: '16px' }}
      >
        {selectedPostLogs.length === 0 ? (
          <div className="text-center text-slate-500 mt-10">Chưa có log hệ thống cho bài viết này.</div>
        ) : (
          <div className="space-y-4">
            {selectedPostLogs.map((log, index) => (
              <div key={index} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getPlatformIcon(log.platform)}
                    <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">{log.platform}</span>
                  </div>
                  {log.status === 'success' ? (
                    <Tag color="success" icon={<CheckCircle2 className="w-3 h-3 mr-1 inline" />}>Thành công</Tag>
                  ) : (
                    <Tag color="error" icon={<XCircle className="w-3 h-3 mr-1 inline" />}>Thất bại</Tag>
                  )}
                </div>
                
                <div className="text-xs text-slate-500 mb-2">
                  Thời gian thực thi: {dayjs(log.attemptedAt).format('DD/MM/YYYY HH:mm:ss')}
                </div>

                {log.status === 'success' && log.publishedUrl && (
                  <a href={log.publishedUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-500 hover:underline inline-flex items-center gap-1 mt-2">
                    Xem bài đăng trực tiếp <Share2 className="w-3 h-3" />
                  </a>
                )}

                {log.status === 'failed' && (
                  <Alert 
                    type="error" 
                    message="Lý do lỗi" 
                    description={log.errorReason || "Lỗi không xác định từ nền tảng"} 
                    className="mt-2 text-xs"
                    showIcon
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default PostsListPage;
