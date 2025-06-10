
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, MessageCircle, Users, TrendingUp, ExternalLink, ShoppingCart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  storeId: string;
}

const DMAnalytics = ({ storeId }: Props) => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['ig-dm-analytics', storeId],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data, error } = await supabase
        .from('ig_dm_analytics')
        .select('*')
        .eq('store_id', storeId)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: topKeywords, isLoading: loadingKeywords } = useQuery({
    queryKey: ['ig-top-keywords', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ig_dm_logs')
        .select('trigger_data')
        .eq('store_id', storeId)
        .eq('trigger_type', 'keyword')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(100);
      
      if (error) throw error;
      
      // Count keyword frequency with proper type checking
      const keywordCounts: { [key: string]: number } = {};
      data.forEach((log) => {
        if (log.trigger_data && typeof log.trigger_data === 'object' && 'keyword' in log.trigger_data) {
          const keyword = (log.trigger_data as any).keyword;
          if (typeof keyword === 'string') {
            keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
          }
        }
      });
      
      return Object.entries(keywordCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([keyword, count]) => ({ keyword, count }));
    },
  });

  const { data: dmLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ['ig-dm-logs', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ig_dm_logs')
        .select('*')
        .eq('store_id', storeId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || loadingKeywords || loadingLogs) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate totals
  const totalDMs = analytics?.reduce((sum, day) => sum + (day.total_dms_sent || 0), 0) || 0;
  const totalLinkClicks = analytics?.reduce((sum, day) => sum + (day.link_clicks || 0), 0) || 0;
  const totalConversions = analytics?.reduce((sum, day) => sum + (day.dm_to_order_conversions || 0), 0) || 0;
  const reelConversions = analytics?.reduce((sum, day) => sum + (day.reel_comment_conversions || 0), 0) || 0;

  const conversionRate = totalDMs > 0 ? ((totalConversions / totalDMs) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total DMs Sent</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDMs}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Link Clicks</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLinkClicks}</div>
            <p className="text-xs text-muted-foreground">
              {totalDMs > 0 ? `${((totalLinkClicks / totalDMs) * 100).toFixed(1)}% click rate` : 'No DMs sent'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders from DMs</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions}</div>
            <p className="text-xs text-muted-foreground">
              {conversionRate}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reel Conversions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reelConversions}</div>
            <p className="text-xs text-muted-foreground">Comment to DM</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Top 5 Trigger Keywords
          </CardTitle>
          <CardDescription>Most used keywords that triggered DMs in the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          {topKeywords && topKeywords.length > 0 ? (
            <div className="space-y-3">
              {topKeywords.map((item, index) => (
                <div key={item.keyword} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <span className="font-medium">{item.keyword}</span>
                  </div>
                  <Badge>{item.count} triggers</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No keyword triggers in the last 7 days</p>
          )}
        </CardContent>
      </Card>

      {/* Daily Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity</CardTitle>
          <CardDescription>DM automation activity for the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics && analytics.length > 0 ? (
            <div className="space-y-3">
              {analytics.map((day) => (
                <div key={day.date} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">
                      {day.total_dms_sent || 0} DMs • {day.link_clicks || 0} clicks • {day.dm_to_order_conversions || 0} orders
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {day.total_dms_sent > 0 ? `${(((day.dm_to_order_conversions || 0) / day.total_dms_sent) * 100).toFixed(1)}%` : '0%'} conversion
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No activity data available</p>
          )}
        </CardContent>
      </Card>

      {/* Recent DM Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent DM Activity</CardTitle>
          <CardDescription>Latest automated DMs sent (last 20)</CardDescription>
        </CardHeader>
        <CardContent>
          {dmLogs && dmLogs.length > 0 ? (
            <div className="space-y-2">
              {dmLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{log.trigger_type}</Badge>
                    <span className="text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <Badge variant={log.status === 'sent' ? 'default' : 'secondary'}>
                    {log.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No recent DM activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DMAnalytics;
