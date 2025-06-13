
import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  className,
  maxWidth = '7xl',
  padding = 'md'
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-3 sm:px-6',
    md: 'px-4 sm:px-6 lg:px-8 xl:px-12',
    lg: 'px-6 sm:px-8 lg:px-12 xl:px-16'
  };

  return (
    <div className={cn(
      "min-h-screen w-full",
      "bg-gray-50 dark:bg-gray-900",
      "transition-colors duration-300",
      paddingClasses[padding],
      "overflow-x-hidden",
      className
    )}>
      <div className={cn("mx-auto w-full", maxWidthClasses[maxWidth])}>
        {children}
      </div>
    </div>
  );
};

export default ResponsiveLayout;
