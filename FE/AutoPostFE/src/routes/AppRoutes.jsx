import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminLayout from '../layouts/AdminLayout';

// Guards
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardOverviewPage from '../pages/dashboard/DashboardOverviewPage';
import ConnectedAccountsPage from '../pages/accounts/ConnectedAccountsPage';
import CreatePostPage from '../pages/posts/CreatePostPage';
import PostsListPage from '../pages/posts/PostsListPage';
import SubscriptionPage from '../pages/billing/SubscriptionPage';
import ProfileSettingsPage from '../pages/profile/ProfileSettingsPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardOverviewPage />} />
            <Route path="/accounts" element={<ConnectedAccountsPage />} />
            <Route path="/posts/create" element={<CreatePostPage />} />
            <Route path="/posts/edit/:id" element={<CreatePostPage />} />
            <Route path="/posts" element={<PostsListPage />} />
            <Route path="/billing" element={<SubscriptionPage />} />
            <Route path="/profile" element={<ProfileSettingsPage />} />
          </Route>
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
