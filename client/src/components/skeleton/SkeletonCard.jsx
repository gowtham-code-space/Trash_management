import React from 'react';
import ThemeStore from '../../store/ThemeStore';

const SkeletonCard = ({ variant = 'medium', className = '' }) => {
  const { isDarkTheme } = ThemeStore();

  const variants = {
    small: 'p-4 rounded-large min-h-32',
    medium: 'p-6 rounded-large min-h-48',
    large: 'p-8 rounded-large min-h-64'
  };

  const baseClass = `${variants[variant] || variants.medium} w-full`;
  const themeClass = isDarkTheme 
    ? 'bg-darkSurface border border-darkBorder animate-pulse' 
    : 'bg-white border border-gray-100 animate-pulse';

  return (
    <div className={`${baseClass} ${themeClass} ${className}`}>
      <div className="space-y-4">
        <div className={`h-4 rounded-small ${isDarkTheme ? 'bg-darkBackground' : 'bg-gray-100'} w-3/4`} />
        <div className={`h-3 rounded-small ${isDarkTheme ? 'bg-darkBackground' : 'bg-gray-100'} w-1/2`} />
        <div className={`h-3 rounded-small ${isDarkTheme ? 'bg-darkBackground' : 'bg-gray-100'} w-full`} />
      </div>
    </div>
  );
};

export default SkeletonCard;
