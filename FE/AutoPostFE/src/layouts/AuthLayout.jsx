import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spin } from 'antd';
import { Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';

const AuthLayout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg)] transition-colors duration-300">
        <Spin size="large" />
      </div>
    );
  }

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] relative overflow-hidden transition-colors duration-300">
      {/* Animated Background glowing nodes */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/30 dark:bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, -90, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 1 }}
        className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/30 dark:bg-amber-600/20 rounded-full blur-[120px] pointer-events-none" 
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-md p-6 sm:p-10 glass-card mx-4"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg mb-4 shadow-indigo-500/40"
          >
            <Rocket className="text-white w-8 h-8" />
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-gradient">AutoPost Studio</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Hệ thống đăng bài tự động đa nền tảng</p>
        </div>
        
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
