import React, { useState } from 'react';
import { Form, Input, Button, Card, Avatar, Divider, message, Tag } from 'antd';
import { User, Lock, Crown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import userApi from '../../api/userApi';
import dayjs from 'dayjs';

const ProfileSettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinishPassword = async (values) => {
    setLoading(true);
    try {
      await userApi.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      });
      message.success('Đổi mật khẩu thành công!');
      form.resetFields();
    } catch (error) {
      message.error(error.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Cài Đặt Hồ Sơ</h1>
        <p className="text-slate-500 dark:text-slate-400">Quản lý thông tin cá nhân và bảo mật tài khoản</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          {/* Profile Summary Card */}
          <Card className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900/50 shadow-sm text-center">
            <Avatar size={100} className="bg-indigo-500 text-3xl font-bold mb-4">
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{user?.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-4">{user?.email}</p>
            
            <div className="flex justify-center mb-4">
              {user?.plan === 'pro' ? (
                <Tag color="purple" icon={<Crown className="w-3 h-3 inline mr-1" />} className="rounded-full px-3 py-1 font-bold">PRO PLAN</Tag>
              ) : (
                <Tag className="rounded-full px-3 py-1 font-bold">FREE PLAN</Tag>
              )}
            </div>

            <Divider className="dark:border-slate-800" />
            
            <div className="text-left text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Vai trò:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ngày tham gia:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{dayjs(user?.createdAt).format('DD/MM/YYYY')}</span>
              </div>
              {user?.plan === 'pro' && user?.planExpiredAt && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Gói PRO hết hạn:</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{dayjs(user.planExpiredAt).format('DD/MM/YYYY')}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card 
            title={<span className="flex items-center gap-2"><Lock className="w-5 h-5 text-slate-500" /> Đổi Mật Khẩu</span>} 
            className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900/50 shadow-sm custom-card-header"
          >
            <Form 
              form={form} 
              layout="vertical" 
              onFinish={onFinishPassword}
              className="max-w-md"
            >
              <Form.Item
                name="oldPassword"
                label="Mật khẩu hiện tại"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
              >
                <Input.Password className="rounded-lg h-10" />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                  { min: 6, message: 'Mật khẩu phải ít nhất 6 ký tự!' }
                ]}
              >
                <Input.Password className="rounded-lg h-10" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password className="rounded-lg h-10" />
              </Form.Item>

              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className="bg-indigo-600 hover:bg-indigo-700 h-10 px-6 rounded-lg"
              >
                Cập Nhật Mật Khẩu
              </Button>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
