import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar } from 'antd';
import { 
  LayoutDashboard, 
  Share2, 
  PenSquare, 
  History, 
  CreditCard, 
  Settings, 
  LogOut,
  Menu as MenuIcon,
  Rocket
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/layout/ThemeToggle';

const { Header, Sider, Content } = Layout;

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { key: '/dashboard', icon: <LayoutDashboard size={18} />, label: <Link to="/dashboard">Tổng quan</Link> },
    { key: '/accounts', icon: <Share2 size={18} />, label: <Link to="/accounts">Tài khoản MXH</Link> },
    { key: '/posts/create', icon: <PenSquare size={18} />, label: <Link to="/posts/create">Tạo bài viết</Link> },
    { key: '/posts', icon: <History size={18} />, label: <Link to="/posts">Lịch sử đăng</Link> },
    { key: '/billing', icon: <CreditCard size={18} />, label: <Link to="/billing">Gói dịch vụ</Link> },
    { key: '/profile', icon: <Settings size={18} />, label: <Link to="/profile">Cài đặt</Link> },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ type: 'divider' });
    menuItems.push({ key: '/admin/users', icon: <Settings size={18} />, label: <Link to="/admin/users">Quản lý User</Link> });
  }

  const userMenu = {
    items: [
      {
        key: 'profile',
        label: <Link to="/profile">Hồ sơ cá nhân</Link>,
      },
      {
        key: 'logout',
        danger: true,
        icon: <LogOut size={16} />,
        label: 'Đăng xuất',
        onClick: logout,
      },
    ],
  };

  return (
    <Layout className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        breakpoint="lg"
        onBreakpoint={(broken) => setCollapsed(broken)}
        className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm"
        theme="light"
      >
        <div className="h-16 flex items-center justify-center border-b border-slate-200 dark:border-slate-800">
          <Rocket className="w-8 h-8 text-indigo-500" />
          {!collapsed && <span className="ml-2 font-bold text-lg text-slate-900 dark:text-white">AutoPost</span>}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="border-none bg-transparent pt-4 px-2 custom-menu"
        />
      </Sider>
      
      <Layout className="bg-transparent">
        <Header className="h-16 px-4 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center">
            <Button
              type="text"
              icon={<MenuIcon />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            />
          </div>
          <div className="flex items-center gap-4">
            {user?.plan === 'pro' ? (
              <div className="hidden sm:flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-amber-200 to-amber-100 dark:from-amber-900/50 dark:to-amber-800/50 border border-amber-300 dark:border-amber-700/50">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">PRO PLAN</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">FREE PLAN</span>
              </div>
            )}
            
            <ThemeToggle />
            
            <Dropdown menu={userMenu} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <Avatar className="bg-indigo-500">{user?.name?.charAt(0).toUpperCase()}</Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-none">{user?.name}</p>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content className="p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
