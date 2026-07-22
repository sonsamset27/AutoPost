import React from 'react';
import { Button, Result } from 'antd';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 text-center">
        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Trang không tồn tại!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.
        </p>
        <Link to="/">
          <Button 
            type="primary" 
            size="large" 
            icon={<Home className="w-4 h-4" />}
            className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 rounded-xl shadow-lg shadow-indigo-500/30 border-none font-medium"
          >
            Về Trang Chủ
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
