
import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn(
      "min-h-screen w-full",
      "bg-gray-50 dark:bg-gray-900",
      "transition-colors duration-300",
      // Mobile-first responsive container
      "px-4 sm:px-6 lg:px-8",
      // Ensure no horizontal scroll
      "overflow-x-hidden",
      className
    )}>
      <div className="mx-auto max-w-7xl w-full">
        {children}
      </div>
    </div>
  );
};

export default ResponsiveLayout;
