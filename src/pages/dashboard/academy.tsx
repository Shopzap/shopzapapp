
import React from 'react';
import { MainLayout } from '@/components/dashboard/MainLayout';

const AcademyPage = () => {
  return (
    <MainLayout title="Seller Academy">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Seller Academy</h2>
          <p className="text-sm text-gray-600">Learn how to grow your business</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-md p-6">
          <p className="text-gray-600">Academy content coming soon...</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default AcademyPage;
