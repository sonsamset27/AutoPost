import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { Mail, Lock, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await authApi.signUp({
        name: values.name,
        email: values.email,
        password: values.password
      });
      message.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (error) {
      message.error(error.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800">
        <p className="text-indigo-600 dark:text-indigo-400 text-sm text-center">
          🎁 Đăng ký ngay hôm nay để nhận gói <strong>FREE</strong> với 30 bài đăng/tháng!
        </p>
      </div>

      <Form name="register" onFinish={onFinish} layout="vertical" size="large">
        <Form.Item
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
        >
          <Input 
            prefix={<User className="w-5 h-5 text-slate-400" />} 
            placeholder="Họ và tên" 
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' }
          ]}
        >
          <Input 
            prefix={<Mail className="w-5 h-5 text-slate-400" />} 
            placeholder="Email" 
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            { min: 6, message: 'Mật khẩu phải ít nhất 6 ký tự!' }
          ]}
        >
          <Input.Password 
            prefix={<Lock className="w-5 h-5 text-slate-400" />} 
            placeholder="Mật khẩu"
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password 
            prefix={<Lock className="w-5 h-5 text-slate-400" />} 
            placeholder="Xác nhận mật khẩu"
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            className="w-full h-12 rounded-lg font-medium text-base shadow-indigo-500/30 hover:shadow-indigo-500/50"
            loading={loading}
          >
            Đăng Ký Tài Khoản
          </Button>
        </Form.Item>
      </Form>
      
      <div className="text-center mt-4">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-indigo-500 hover:text-indigo-600 font-medium">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
