
import React from 'react';
import { MainLayout } from '@/components/dashboard/MainLayout';

const CustomizePage = () => {
  return (
    <MainLayout title="Customize Store">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Store Customization</h2>
          <p className="text-sm text-gray-600">Customize your store's appearance and settings</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-md p-6">
          <p className="text-gray-600">Customization features coming soon...</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default CustomizePage;
