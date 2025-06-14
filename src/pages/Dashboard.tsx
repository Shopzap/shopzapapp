
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StoreStats from "@/components/dashboard/StoreStats";
import RecentOrdersList from "@/components/dashboard/RecentOrdersList";
import { ReferralStats } from "@/components/dashboard/ReferralStats";
import QuickActionsCard from "@/components/dashboard/QuickActionsCard";
import StoreUrlCard from "@/components/dashboard/StoreUrlCard";
import { useStore } from "@/contexts/StoreContext";
import { ExternalLink, Plus, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { storeData } = useStore();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {storeData?.name || 'Store Owner'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your store today.
        </p>
      </div>

      {/* Store URL Card */}
      <StoreUrlCard storeData={storeData} />

      {/* Stats Overview */}
      <StoreStats 
        productCount={storeData?.product_count || 0} 
        orderCount={storeData?.order_count || 0} 
        plan={storeData?.plan || 'free'} 
      />

      {/* Main Dashboard Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <QuickActionsCard />

        {/* Referral Stats */}
        <ReferralStats />

        {/* Analytics Quick View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics
            </CardTitle>
            <CardDescription>
              View detailed store analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/analytics">
              <Button className="w-full">
                View Analytics
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <RecentOrdersList 
        orders={storeData?.recent_orders || []} 
        onCopyStoreLink={() => {
          if (storeData?.username) {
            const storeLink = `${window.location.origin}/store/${storeData.username}`;
            navigator.clipboard.writeText(storeLink);
          }
        }} 
      />
    </div>
  );
};

export default Dashboard;
