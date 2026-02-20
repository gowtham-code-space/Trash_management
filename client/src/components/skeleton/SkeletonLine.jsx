import React from 'react';
import ThemeStore from '../../store/ThemeStore';

const SkeletonLine = ({ variant = 'medium', width = 'full', className = '' }) => {
  const { isDarkTheme } = ThemeStore();

  const variants = {
    small: 'h-3',
    medium: 'h-4',
    large: 'h-5',
    heading: 'h-6'
  };

  const widths = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/3': 'w-1/3',
    '1/4': 'w-1/4'
  };

  const baseClass = `${variants[variant] || variants.medium} ${widths[width] || widths.full} rounded-small`;
  const themeClass = isDarkTheme 
    ? 'bg-darkSurface animate-pulse' 
    : 'bg-gray-200 animate-pulse';

  return (
    <div className={`${baseClass} ${themeClass} ${className}`} />
  );
};

export default SkeletonLine;
