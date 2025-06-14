
import React from 'react';
import { MainLayout } from '@/components/dashboard/MainLayout';

const PlanPage = () => {
  return (
    <MainLayout title="Plan">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Subscription Plan</h2>
          <p className="text-sm text-gray-600">Manage your subscription and billing</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-md p-6">
          <p className="text-gray-600">Plan management coming soon...</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default PlanPage;
