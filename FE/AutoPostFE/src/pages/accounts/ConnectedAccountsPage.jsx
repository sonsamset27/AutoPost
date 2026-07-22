import React, { useEffect, useState } from 'react';
import { Card, Button, Switch, Modal, Form, Input, Radio, message, Tag, Space, Popconfirm } from 'antd';
import { Share2, Trash2, Edit2, Send, Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import accountApi from '../../api/accountApi';
import dayjs from 'dayjs';

const ConnectedAccountsPage = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [platform, setPlatform] = useState('telegram');

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await accountApi.getAccounts();
      setAccounts(res.data || []);
    } catch (error) {
      if (error.statusCode === 404) {
        setAccounts([]); // Danh sách rỗng, không phải lỗi
      } else {
        message.error('Không thể tải danh sách tài khoản');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await accountApi.updateAccount(id, { isActive: !currentStatus });
      message.success('Cập nhật trạng thái thành công');
      fetchAccounts();
    } catch (error) {
      message.error('Cập nhật thất bại');
    }
  };

  const handleDelete = async (id) => {
    try {
      await accountApi.deleteAccount(id);
      message.success('Đã xóa liên kết tài khoản');
      fetchAccounts();
    } catch (error) {
      message.error('Xóa thất bại');
    }
  };

  const handleConnect = async (values) => {
    setSubmitting(true);
    try {
      const config = {};
      if (values.platform === 'telegram') {
        config.botToken = values.botToken;
        config.chatId = values.chatId;
      } else if (values.platform === 'discord') {
        config.webhookUrl = values.webhookUrl;
      }

      await accountApi.connectAccount({
        platform: values.platform,
        config
      });
      message.success('Liên kết tài khoản thành công!');
      setIsModalOpen(false);
      form.resetFields();
      fetchAccounts();
    } catch (error) {
      message.error(error.message || 'Liên kết thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const getPlatformIcon = (platform) => {
    if (platform === 'telegram') return <Send className="text-blue-500 w-8 h-8" />;
    // Mock discord with Share2 for now since lucide doesn't have discord
    if (platform === 'discord') return <Share2 className="text-indigo-500 w-8 h-8" />;
    return <Share2 className="w-8 h-8 text-slate-500" />;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Tài khoản kết nối</h1>
          <p className="text-slate-500 dark:text-slate-400">Quản lý các tài khoản mạng xã hội để tự động phát tin bài</p>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 h-10 px-6 rounded-lg shadow-indigo-500/30"
          disabled={user?.plan === 'free' && accounts.length >= 3}
        >
          Liên Kết Tài Khoản
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} loading={true} className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900/50" />
          ))
        ) : accounts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
            Chưa có tài khoản nào được kết nối.
          </div>
        ) : (
          accounts.map(acc => (
            <Card
              key={acc._id}
              className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  {getPlatformIcon(acc.platform)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate" title={acc.platformAccountName}>
                    {acc.platformAccountName}
                  </h3>
                  <div className="text-xs text-slate-500 mt-1 capitalize">{acc.platform}</div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Trạng thái:</span>
                  <Switch
                    checked={acc.isActive}
                    onChange={() => handleToggleActive(acc._id, acc.isActive)}
                    size="small"
                  />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Ngày tạo:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {dayjs(acc.createdAt).format('DD/MM/YYYY')}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                <Popconfirm
                  title="Xóa tài khoản?"
                  description="Bạn có chắc muốn hủy liên kết tài khoản này?"
                  onConfirm={() => handleDelete(acc._id)}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger block icon={<Trash2 className="w-4 h-4" />}>
                    Xóa
                  </Button>
                </Popconfirm>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        title="Liên kết tài khoản mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleConnect}
          initialValues={{ platform: 'telegram' }}
        >
          <Form.Item name="platform" label="Nền tảng">
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              className="w-full flex"
              onChange={(e) => setPlatform(e.target.value)}
            >
              <Radio.Button value="telegram" className="flex-1 text-center">Telegram</Radio.Button>
              <Radio.Button value="discord" className="flex-1 text-center">Discord</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {platform === 'telegram' && (
            <>
              <Form.Item
                name="botToken"
                label="Bot Token"
                rules={[{ required: true, message: 'Vui lòng nhập Bot Token!' }]}
                tooltip="Lấy token từ @BotFather trên Telegram"
              >
                <Input placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ" />
              </Form.Item>
              <Form.Item
                name="chatId"
                label="Chat ID (Kênh / Nhóm)"
                rules={[{ required: true, message: 'Vui lòng nhập Chat ID!' }]}
                tooltip="Ví dụ: -100123456789"
              >
                <Input placeholder="-100123456789" />
              </Form.Item>
            </>
          )}

          {platform === 'discord' && (
            <Form.Item
              name="webhookUrl"
              label="Webhook URL"
              rules={[{ required: true, message: 'Vui lòng nhập Webhook URL!' }]}
            >
              <Input placeholder="https://discord.com/api/webhooks/..." />
            </Form.Item>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>Kiểm Tra & Kết Nối</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ConnectedAccountsPage;
