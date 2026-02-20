import React from 'react';
import ThemeStore from '../../store/ThemeStore';

const SkeletonAvatar = ({ variant = 'medium', className = '' }) => {
  const { isDarkTheme } = ThemeStore();

  const variants = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xlarge: 'w-24 h-24'
  };

  const baseClass = `${variants[variant] || variants.medium} rounded-full flex-shrink-0`;
  const themeClass = isDarkTheme 
    ? 'bg-darkSurface animate-pulse' 
    : 'bg-gray-200 animate-pulse';

  return (
    <div className={`${baseClass} ${themeClass} ${className}`} />
  );
};

export default SkeletonAvatar;
