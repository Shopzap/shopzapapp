
import React from 'react';
import { MessageCircle, TrendingUp, Users, Calendar } from 'lucide-react';

interface AnalyticsMetricsGridProps {
  analytics: {
    totalDmsSent: number;
    reelConversions: number;
    linkClicks: number;
    orderConversions: number;
  } | null;
}

const AnalyticsMetricsGrid: React.FC<AnalyticsMetricsGridProps> = ({ analytics }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <MessageCircle className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Total DMs Sent</span>
        </div>
        <p className="text-2xl font-bold text-blue-900">
          {analytics?.totalDmsSent || 0}
        </p>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-900">Reel Conversions</span>
        </div>
        <p className="text-2xl font-bold text-green-900">
          {analytics?.reelConversions || 0}
        </p>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Users className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-900">Link Clicks</span>
        </div>
        <p className="text-2xl font-bold text-purple-900">
          {analytics?.linkClicks || 0}
        </p>
      </div>

      <div className="bg-orange-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Calendar className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-900">Orders from DMs</span>
        </div>
        <p className="text-2xl font-bold text-orange-900">
          {analytics?.orderConversions || 0}
        </p>
      </div>
    </div>
  );
};

export default AnalyticsMetricsGrid;
