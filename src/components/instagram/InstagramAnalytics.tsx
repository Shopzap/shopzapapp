
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3 } from 'lucide-react';
import { useInstagramAnalytics } from '@/hooks/useInstagramAnalytics';
import AnalyticsMetricsGrid from './analytics/AnalyticsMetricsGrid';
import TriggerTypeBreakdown from './analytics/TriggerTypeBreakdown';
import RecentActivity from './analytics/RecentActivity';
import PerformanceInsights from './analytics/PerformanceInsights';

interface InstagramAnalyticsProps {
  storeData: any;
  igConnection: any;
}

const InstagramAnalytics: React.FC<InstagramAnalyticsProps> = ({
  storeData,
  igConnection
}) => {
  const [timeRange, setTimeRange] = useState('7days');
  const { analytics, dmLogs, isLoading, triggerStats } = useInstagramAnalytics(
    storeData?.id, 
    timeRange
  );

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Instagram Automation Analytics</span>
              </CardTitle>
              <CardDescription>
                Track the performance of your Instagram automation campaigns.
              </CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <AnalyticsMetricsGrid analytics={analytics} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TriggerTypeBreakdown triggerStats={triggerStats} />
        <RecentActivity dmLogs={dmLogs} />
      </div>

      <PerformanceInsights analytics={analytics} />
    </div>
  );
};

export default InstagramAnalytics;
