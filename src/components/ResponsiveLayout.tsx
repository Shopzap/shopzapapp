
import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  className,
}) => {
  return (
    <div className={cn(
      "min-h-screen w-full",
      "bg-gray-50 dark:bg-gray-900",
      "transition-colors duration-300",
      className
    )}>
      {children}
    </div>
  );
};

export default ResponsiveLayout;
