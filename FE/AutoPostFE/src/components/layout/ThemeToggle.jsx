import React from 'react';
import { Button } from 'antd';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Button 
      type="text" 
      onClick={toggleTheme} 
      className="flex items-center justify-center w-10 h-10 rounded-full"
      icon={
        isDarkMode ? 
        <Moon className="w-5 h-5 text-indigo-400" /> : 
        <Sun className="w-5 h-5 text-amber-500" />
      }
    />
  );
};

export default ThemeToggle;
