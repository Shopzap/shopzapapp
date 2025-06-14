
import React from 'react';
import { MainLayout } from '@/components/dashboard/MainLayout';

const SettingsPage = () => {
  return (
    <MainLayout title="Settings">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Store Settings</h2>
          <p className="text-sm text-gray-600">Configure your store preferences</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-md p-6">
          <p className="text-gray-600">Settings panel coming soon...</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
