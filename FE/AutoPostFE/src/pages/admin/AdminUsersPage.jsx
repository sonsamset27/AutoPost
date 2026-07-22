import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Input, Select, Switch, Space, Popconfirm, Modal, InputNumber, App } from 'antd';
import { Search, ShieldAlert, Crown, Trash2, Settings, UserCircle } from 'lucide-react';
import adminApi from '../../api/adminApi';
import dayjs from 'dayjs';

const AdminUsersPage = () => {
  const { message } = App.useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [durationDays, setDurationDays] = useState(30);
  const [upgrading, setUpgrading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers();
      setUsers(res.data?.users || res.data || []);
    } catch (error) {
      if (!error.message?.includes('404')) {
        message.error('Lỗi khi tải danh sách người dùng');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBan = async (id, currentStatus) => {
    try {
      await adminApi.banUser(id, !currentStatus);
      message.success(currentStatus ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản');
      fetchUsers();
    } catch (error) {
      message.error('Thao tác thất bại');
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteUser(id);
      message.success('Đã xóa vĩnh viễn người dùng');
      fetchUsers();
    } catch (error) {
      message.error('Xóa thất bại');
    }
  };

  const handleUpgradeConfirm = async () => {
    setUpgrading(true);
    try {
      await adminApi.upgradeUserPlan(selectedUserId, 'pro', durationDays);
      message.success('Đã cấp gói PRO thành công');
      setUpgradeModalOpen(false);
      fetchUsers();
    } catch (error) {
      message.error('Nâng cấp thất bại');
    } finally {
      setUpgrading(false);
    }
  };

  const openUpgradeModal = (id) => {
    setSelectedUserId(id);
    setDurationDays(30);
    setUpgradeModalOpen(true);
  };

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-200">{name}</div>
            <div className="text-xs text-slate-500">{record.email}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'default'} className="capitalize">{role}</Tag>
      )
    },
    {
      title: 'Gói dịch vụ',
      dataIndex: 'plan',
      key: 'plan',
      render: (plan, record) => (
        <div>
          {plan === 'pro' ? (
            <Tag color="purple" icon={<Crown className="w-3 h-3 mr-1 inline" />}>PRO</Tag>
          ) : (
            <Tag>FREE</Tag>
          )}
          {plan === 'pro' && record.planExpiredAt && (
            <div className="text-xs text-slate-400 mt-1">
              Hết hạn: {dayjs(record.planExpiredAt).format('DD/MM/YYYY')}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Switch 
            size="small" 
            checked={!record.isBanned} 
            onChange={() => handleToggleBan(record._id, record.isBanned)}
            className={record.isBanned ? 'bg-red-500' : 'bg-emerald-500'}
          />
          <span className="text-xs">{record.isBanned ? 'Bị khóa' : 'Hoạt động'}</span>
        </div>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<Crown className="w-4 h-4 text-amber-500" />}
            onClick={() => openUpgradeModal(record._id)}
            title="Cấp gói PRO"
          />
          <Popconfirm
            title="Xóa vĩnh viễn user này?"
            description="Tất cả bài viết, tài khoản liên kết sẽ bị xóa sạch."
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa Ngay"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<Trash2 className="w-4 h-4" />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-indigo-500" /> Quản Trị Người Dùng
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Xem danh sách, phân quyền và khóa tài khoản</p>
      </div>

      <div className="bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-4">
        <Input 
          placeholder="Tìm email hoặc tên..." 
          prefix={<Search className="w-4 h-4 text-slate-400" />}
          className="max-w-sm rounded-lg"
        />
        <Select defaultValue="all" className="w-32 rounded-lg" options={[
          { value: 'all', label: 'Tất cả gói' },
          { value: 'free', label: 'FREE' },
          { value: 'pro', label: 'PRO' },
        ]} />
      </div>

      <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={users} 
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          className="custom-table"
        />
      </div>

      <Modal
        title={<span className="flex items-center gap-2"><Crown className="w-5 h-5 text-amber-500" /> Cấp Gói PRO Thủ Công</span>}
        open={upgradeModalOpen}
        onOk={handleUpgradeConfirm}
        onCancel={() => setUpgradeModalOpen(false)}
        confirmLoading={upgrading}
        okText="Nâng Cấp"
        cancelText="Hủy"
      >
        <div className="py-4">
          <p className="mb-4 text-slate-600 dark:text-slate-300">
            Bạn đang cấp gói <strong>PRO</strong> cho người dùng này. Vui lòng nhập số ngày gia hạn thêm:
          </p>
          <div className="flex items-center gap-3">
            <span className="text-slate-500">Số ngày:</span>
            <InputNumber 
              min={1} 
              max={3650} 
              value={durationDays} 
              onChange={setDurationDays}
              className="w-32"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
