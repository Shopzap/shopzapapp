
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Package, ShoppingBag, Store } from 'lucide-react';

type StoreStatsProps = {
  productCount: number;
  orderCount: number;
  plan: string;
};

const StoreStats: React.FC<StoreStatsProps> = ({ productCount, orderCount, plan }) => {
  const stats = [
    {
      title: "Total Products",
      value: productCount,
      icon: <Package className="h-4 w-4" />,
      description: productCount === 0 ? "Add your first product" : `${productCount} products in your store`,
    },
    {
      title: "Total Orders",
      value: orderCount,
      icon: <ShoppingBag className="h-4 w-4" />,
      description: orderCount === 0 ? "No orders yet" : `${orderCount} orders received`,
    },
    {
      title: "Current Plan",
      value: plan.charAt(0).toUpperCase() + plan.slice(1),
      icon: <Store className="h-4 w-4" />,
      description: plan === 'free' ? "Upgrade to unlock more features" : "All features unlocked",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary p-2 rounded-full">
                {stat.icon}
              </div>
              <div className="font-medium">{stat.title}</div>
            </div>
            <div className="mt-3 text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.description}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StoreStats;
