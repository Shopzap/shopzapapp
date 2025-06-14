
import React from 'react';
import { MainLayout } from '@/components/dashboard/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Box, DollarSign, TrendingUp, Plus, ExternalLink } from 'lucide-react';

const DashboardPage = () => {
  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Products"
            value="24"
            change="+2 this week"
            changeType="increase"
            icon={Package}
            iconColor="text-blue-600"
          />
          <StatCard
            title="Total Orders"
            value="142"
            change="+12% from last month"
            changeType="increase"
            icon={Box}
            iconColor="text-green-600"
          />
          <StatCard
            title="Revenue"
            value="₹45,230"
            change="+8% from last month"
            changeType="increase"
            icon={DollarSign}
            iconColor="text-purple-600"
          />
          <StatCard
            title="Conversion Rate"
            value="3.2%"
            change="+0.4% from last week"
            changeType="increase"
            icon={TrendingUp}
            iconColor="text-orange-600"
          />
        </div>

        {/* Store Link Card */}
        <Card className="rounded-2xl shadow-md border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Your Store</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Store Link</p>
                <p className="text-lg font-medium text-blue-600">shopzap.io/yourstore</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Copy Link
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-2xl shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button className="h-16 flex-col space-y-2">
                  <Plus className="h-5 w-5" />
                  <span className="text-sm">Add Product</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col space-y-2">
                  <Package className="h-5 w-5" />
                  <span className="text-sm">View Products</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col space-y-2">
                  <Box className="h-5 w-5" />
                  <span className="text-sm">Orders</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col space-y-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm">Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">New order received</p>
                  <span className="text-xs text-gray-400 ml-auto">2 min ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">Product added</p>
                  <span className="text-xs text-gray-400 ml-auto">1 hour ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">Store customized</p>
                  <span className="text-xs text-gray-400 ml-auto">3 hours ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
