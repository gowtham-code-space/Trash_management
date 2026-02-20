import React from 'react';
import ThemeStore from '../../store/ThemeStore';

const SkeletonButton = ({ variant = 'medium', width = 'auto', className = '' }) => {
  const { isDarkTheme } = ThemeStore();

  const variants = {
    small: 'px-4 py-2 h-9',
    medium: 'px-6 py-3 h-11',
    large: 'px-8 py-4 h-14'
  };

  const widths = {
    auto: 'w-auto',
    full: 'w-full',
    fit: 'w-fit'
  };

  const baseClass = `${variants[variant] || variants.medium} ${widths[width] || widths.auto} rounded-medium inline-flex items-center justify-center`;
  const themeClass = isDarkTheme 
    ? 'bg-darkSurface animate-pulse' 
    : 'bg-gray-200 animate-pulse';

  return (
    <div className={`${baseClass} ${themeClass} ${className}`}>
      <div className={`h-3 w-20 rounded-small ${isDarkTheme ? 'bg-darkBackground' : 'bg-gray-100'}`} />
    </div>
  );
};

export default SkeletonButton;
