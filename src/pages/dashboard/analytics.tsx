
import React from 'react';
import { MainLayout } from '@/components/dashboard/MainLayout';

const AnalyticsPage = () => {
  return (
    <MainLayout title="Analytics">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Store Analytics</h2>
          <p className="text-sm text-gray-600">Track your store's performance and insights</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-md p-6">
          <p className="text-gray-600">Analytics dashboard coming soon...</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
