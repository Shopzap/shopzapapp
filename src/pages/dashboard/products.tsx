
import React from 'react';
import { MainLayout } from '@/components/dashboard/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

const ProductsPage = () => {
  return (
    <MainLayout title="Products">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Manage Products</h2>
            <p className="text-sm text-gray-600">Add, edit, and organize your products</p>
          </div>
          <Button className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Filters */}
        <Card className="rounded-2xl shadow-md border-0">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search products..." className="pl-10" />
              </div>
              <Button variant="outline" className="rounded-xl">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Card key={item} className="rounded-2xl shadow-md border-0 overflow-hidden">
              <div className="aspect-square bg-gray-100"></div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">Product {item}</h3>
                <p className="text-sm text-gray-600 mb-2">Short description</p>
                <p className="text-lg font-bold text-gray-900">₹999</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductsPage;
