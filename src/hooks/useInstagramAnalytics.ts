
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  totalDmsSent: number;
  reelConversions: number;
  linkClicks: number;
  orderConversions: number;
  dailyData: any[];
}

interface DmLog {
  id: string;
  trigger_type: string;
  message_sent: unknown;
  created_at: string;
}

export const useInstagramAnalytics = (storeId: string, timeRange: string) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [dmLogs, setDmLogs] = useState<DmLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        .eq('store_id', storeId)
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
        .eq('store_id', storeId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setDmLogs(data || []);
    } catch (error) {
      console.error("Error fetching DM logs:", error);
    }
  };

  useEffect(() => {
    if (storeId) {
      fetchAnalytics();
      fetchDmLogs();
    }
  }, [storeId, timeRange]);

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

  return {
    analytics,
    dmLogs,
    isLoading,
    triggerStats: getTriggerTypeStats()
  };
};
