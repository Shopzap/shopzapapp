
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar collapsed={sidebarCollapsed} />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={toggleMobileMenu}
            />
            <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
              <Sidebar />
            </div>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <Topbar 
            title={title} 
            onToggleSidebar={toggleMobileMenu}
          />
          
          <main className="px-6 py-4">
            <div className="max-w-screen-xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
