
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { PlusCircle } from 'lucide-react';

interface DashboardHeaderProps {
  storeName: string;
  productCount: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ storeName, productCount }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{storeName}</h1>
        <p className="text-muted-foreground">Welcome to your store dashboard</p>
      </div>
      {productCount === 0 ? (
        <Button onClick={() => navigate('/dashboard/products')} className="self-start w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add your first product
        </Button>
      ) : (
        <Button onClick={() => navigate('/dashboard/products')} className="self-start w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Product
        </Button>
      )}
    </div>
  );
};

export default DashboardHeader;
