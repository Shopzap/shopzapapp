
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, MessageCircle, TrendingUp, Users, Calendar } from 'lucide-react';

interface InstagramAnalyticsProps {
  storeData: any;
  igConnection: any;
}

const InstagramAnalytics: React.FC<InstagramAnalyticsProps> = ({
  storeData,
  igConnection
}) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [dmLogs, setDmLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');

  useEffect(() => {
    fetchAnalytics();
    fetchDmLogs();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7days':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      const { data, error } = await supabase
        .from('ig_dm_analytics')
        .select('*')
        .eq('store_id', storeData.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;

      // Aggregate the data
      const aggregated = {
        totalDmsSent: data?.reduce((sum, day) => sum + (day.total_dms_sent || 0), 0) || 0,
        reelConversions: data?.reduce((sum, day) => sum + (day.reel_comment_conversions || 0), 0) || 0,
        linkClicks: data?.reduce((sum, day) => sum + (day.link_clicks || 0), 0) || 0,
        orderConversions: data?.reduce((sum, day) => sum + (day.dm_to_order_conversions || 0), 0) || 0,
        dailyData: data || []
      };

      setAnalytics(aggregated);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDmLogs = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30); // Last 30 days for logs

      const { data, error } = await supabase
        .from('ig_dm_logs')
        .select('*')
        .eq('store_id', storeData.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setDmLogs(data || []);
    } catch (error) {
      console.error("Error fetching DM logs:", error);
    }
  };

  const getTriggerTypeStats = () => {
    const stats = dmLogs.reduce((acc, log) => {
      acc[log.trigger_type] = (acc[log.trigger_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(stats).map(([type, count]) => ({
      type: type.replace('_', ' ').toUpperCase(),
      count
    }));
  };

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  const triggerStats = getTriggerTypeStats();

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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trigger Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Trigger Type Breakdown</CardTitle>
            <CardDescription>
              How your DMs are being triggered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {triggerStats.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No trigger data available yet
                </p>
              ) : (
                triggerStats.map((stat) => (
                  <div key={stat.type} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{stat.type}</span>
                    <span className="text-sm text-muted-foreground">{stat.count}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest automated DM activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {dmLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              ) : (
                dmLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="border-l-2 border-blue-200 pl-3 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">
                          {log.trigger_type.replace('_', ' ').toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.message_sent ? `${String(log.message_sent).substring(0, 50)}...` : 'DM sent'}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>
            Tips to improve your Instagram automation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">💡 Optimization Tips</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Use engaging keywords that your audience commonly uses</li>
                <li>• Keep your auto-reply messages short and friendly</li>
                <li>• Include clear call-to-actions in your DM responses</li>
                <li>• Test different message templates to see what works best</li>
              </ul>
            </div>

            {analytics?.totalDmsSent > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">📈 Your Performance</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-green-800">Conversion Rate</span>
                    <p className="font-bold text-green-900">
                      {analytics.totalDmsSent > 0 
                        ? ((analytics.orderConversions / analytics.totalDmsSent) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-green-800">Click-through Rate</span>
                    <p className="font-bold text-green-900">
                      {analytics.totalDmsSent > 0 
                        ? ((analytics.linkClicks / analytics.totalDmsSent) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstagramAnalytics;
