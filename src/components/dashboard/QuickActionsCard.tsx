
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Palette, Settings, Instagram } from 'lucide-react';

const QuickActionsCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/products')}>
            <Package className="mr-2 h-4 w-4" /> Manage Products
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/customize-store')}>
            <Palette className="mr-2 h-4 w-4" /> Customize Storefront
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/instagram')}>
            <Instagram className="mr-2 h-4 w-4" /> Instagram Automation
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/settings')}>
            <Settings className="mr-2 h-4 w-4" /> Store Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
