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
          colorPrimary: '#6366f1',
          colorBgContainer: isDarkMode ? '#0f172a' : '#ffffff',
          colorBgElevated: isDarkMode ? '#1e293b' : '#ffffff',
          borderRadius: 10,
          fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif"
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