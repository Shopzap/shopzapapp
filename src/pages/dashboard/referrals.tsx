
import React from 'react';
import { MainLayout } from '@/components/dashboard/MainLayout';

const ReferralsPage = () => {
  return (
    <MainLayout title="Referrals & Bonuses">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Referral Program</h2>
          <p className="text-sm text-gray-600">Track referrals and earn bonuses</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-md p-6">
          <p className="text-gray-600">Referral system coming soon...</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default ReferralsPage;
