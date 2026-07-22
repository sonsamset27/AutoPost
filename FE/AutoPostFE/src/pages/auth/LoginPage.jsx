import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { Mail, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values);
      message.success('Đăng nhập thành công!');
    } catch (error) {
      message.error(error.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Form name="login" onFinish={onFinish} layout="vertical" size="large">
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
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        >
          <Input.Password 
            prefix={<Lock className="w-5 h-5 text-slate-400" />} 
            placeholder="Mật khẩu"
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="w-full h-12 rounded-xl font-semibold text-base bg-gradient-to-r from-indigo-500 to-violet-500 border-none shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
              loading={loading}
            >
              Đăng Nhập
            </Button>
          </motion.div>
        </Form.Item>
      </Form>
      
      <div className="text-center mt-4">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-indigo-500 hover:text-indigo-600 font-medium">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
