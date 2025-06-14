
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, ShoppingCart, TrendingUp } from 'lucide-react';
import { useReferralStats } from '@/hooks/useReferralStats';
import { useStore } from '@/contexts/StoreContext';

export const ReferralStats: React.FC = () => {
  const { storeData } = useStore();
  const { totalVisits, conversions, orders, conversionRate, isLoading } = useReferralStats(storeData?.id || '');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Referral Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    { label: 'Total Visits', value: totalVisits, icon: Users, color: 'text-blue-600' },
    { label: 'Conversions', value: conversions, icon: UserCheck, color: 'text-green-600' },
    { label: 'Orders', value: orders, icon: ShoppingCart, color: 'text-purple-600' },
    { label: 'Rate', value: `${conversionRate.toFixed(1)}%`, icon: TrendingUp, color: 'text-orange-600' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Referral Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={`${stat.color} text-2xl font-bold`}>
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        
        {storeData?.username && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Your referral link:</p>
            <code className="text-xs bg-white p-2 rounded border block break-all">
              {window.location.origin}?ref={storeData.username}
            </code>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
