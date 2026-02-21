import React from 'react';
import ThemeStore from '../../store/ThemeStore';

const SkeletonBlock = ({ variant = 'medium', height = 'auto', className = '' }) => {
  const { isDarkTheme } = ThemeStore();

  const variants = {
    small: 'rounded-medium',
    medium: 'rounded-large',
    large: 'rounded-large'
  };

  const heights = {
    auto: 'h-auto',
    small: 'h-20',
    medium: 'h-32',
    large: 'h-48',
    xlarge: 'h-64'
  };

  const baseClass = `w-full ${variants[variant] || variants.medium} ${heights[height] || heights.auto}`;
  const themeClass = isDarkTheme 
    ? 'bg-darkSurface animate-pulse' 
    : 'bg-gray-200 animate-pulse';

  return (
    <div className={`${baseClass} ${themeClass} ${className}`} />
  );
};

export default SkeletonBlock;
