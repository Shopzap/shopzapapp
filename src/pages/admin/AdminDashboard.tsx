
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  AlertTriangle,
  FileText,
  TrendingUp,
  Activity,
  Calendar
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface DashboardStats {
  totalSellers: number;
  totalProducts: number;
  pendingComplaints: number;
  totalPayouts: number;
  pendingPayouts: number;
  blogPostsCount: number;
  todayOrders: number;
  weeklyRevenue: number;
}

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: async (): Promise<DashboardStats> => {
      const [
        sellersResult,
        productsResult,
        payoutsResult,
        ordersResult
      ] = await Promise.all([
        supabase.from('stores').select('id', { count: 'exact' }),
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('payout_requests').select('id, status, final_amount', { count: 'exact' }),
        supabase.from('orders').select('id, total_price, created_at').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayOrders = ordersResult.data?.filter(order => 
        new Date(order.created_at) >= todayStart
      ).length || 0;

      const weeklyRevenue = ordersResult.data?.reduce((sum, order) => 
        sum + (order.total_price || 0), 0
      ) || 0;

      const pendingPayouts = payoutsResult.data?.filter(p => p.status === 'pending').length || 0;

      return {
        totalSellers: sellersResult.count || 0,
        totalProducts: productsResult.count || 0,
        pendingComplaints: 0, // To be implemented
        totalPayouts: payoutsResult.count || 0,
        pendingPayouts,
        blogPostsCount: 0, // To be implemented
        todayOrders,
        weeklyRevenue
      };
    }
  });

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description, 
    trend, 
    color = "blue" 
  }: {
    title: string;
    value: string | number;
    icon: any;
    description: string;
    trend?: string;
    color?: string;
  }) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <Badge variant="secondary" className="text-xs">
              {trend}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to ShopZap Admin Panel</h1>
        <p className="text-purple-100">
          Monitor and manage your platform with comprehensive analytics and controls
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sellers"
          value={stats?.totalSellers || 0}
          icon={Users}
          description="Active sellers on platform"
          trend="+12%"
          color="blue"
        />
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={ShoppingCart}
          description="Products listed"
          trend="+8%"
          color="green"
        />
        <StatCard
          title="Pending Complaints"
          value={stats?.pendingComplaints || 0}
          icon={AlertTriangle}
          description="Requires attention"
          color="orange"
        />
        <StatCard
          title="Blog Posts"
          value={stats?.blogPostsCount || 0}
          icon={FileText}
          description="Published articles"
          color="purple"
        />
        <StatCard
          title="Total Payouts"
          value={stats?.totalPayouts || 0}
          icon={DollarSign}
          description="All time payouts"
          color="green"
        />
        <StatCard
          title="Pending Payouts"
          value={stats?.pendingPayouts || 0}
          icon={Calendar}
          description="Awaiting processing"
          color="red"
        />
        <StatCard
          title="Today's Orders"
          value={stats?.todayOrders || 0}
          icon={TrendingUp}
          description="Orders placed today"
          trend="+15%"
          color="blue"
        />
        <StatCard
          title="Weekly Revenue"
          value={`₹${(stats?.weeklyRevenue || 0).toLocaleString()}`}
          icon={Activity}
          description="Last 7 days"
          trend="+22%"
          color="green"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <DollarSign className="h-4 w-4 mr-2" />
              Process Weekly Payouts
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Review Pending Complaints
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Verify New Sellers
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Publish New Blog Post
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Platform performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Server Performance</span>
                <span>98%</span>
              </div>
              <Progress value={98} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Database Health</span>
                <span>95%</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Payment Gateway</span>
                <span>100%</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Email Service</span>
                <span>97%</span>
              </div>
              <Progress value={97} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system events and actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: '2 min ago', action: 'New seller registration', user: 'TechStore India', type: 'success' },
              { time: '15 min ago', action: 'Payout processed', user: '₹15,420 to Fashion Hub', type: 'info' },
              { time: '1 hour ago', action: 'Product reported', user: 'Fake iPhone 15', type: 'warning' },
              { time: '2 hours ago', action: 'Blog post published', user: 'E-commerce Trends 2024', type: 'success' },
              { time: '3 hours ago', action: 'Complaint resolved', user: 'Order #12345', type: 'success' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`h-2 w-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.user}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
