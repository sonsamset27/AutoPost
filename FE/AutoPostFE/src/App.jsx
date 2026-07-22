import React from 'react';
import { ConfigProvider, theme as antdTheme, App as AntdApp } from 'antd';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { useTheme } from './hooks/useTheme';
import AppRoutes from './routes/AppRoutes';

const AppConfigProvider = () => {
  const { isDarkMode } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#6366f1', /* Vibrant Indigo */
          colorBgContainer: isDarkMode ? '#0f172a' : '#ffffff',
          colorBgElevated: isDarkMode ? '#1e293b' : '#ffffff',
          colorBorder: isDarkMode ? '#1e293b' : '#e2e8f0',
          borderRadius: 12,
          fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
          controlHeight: 44,
        }
      }}
    >
      <AntdApp>
        <AppRoutes />
      </AntdApp>
    </ConfigProvider>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppConfigProvider />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;