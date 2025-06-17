
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Eye, Ban, Trash2, CheckCircle, ExternalLink } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Seller {
  id: string;
  name: string;
  username: string;
  business_email: string;
  plan: string;
  is_active: boolean;
  created_at: string;
  product_count: number;
}

const SellerManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: sellers, isLoading, refetch } = useQuery({
    queryKey: ['sellers', searchTerm],
    queryFn: async (): Promise<Seller[]> => {
      let query = supabase
        .from('stores')
        .select(`
          id,
          name,
          username,
          business_email,
          plan,
          is_active,
          created_at,
          products(count)
        `);

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,business_email.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(store => ({
        ...store,
        product_count: store.products?.[0]?.count || 0
      }));
    }
  });

  const handleSellerAction = async (sellerId: string, action: 'ban' | 'activate' | 'delete') => {
    try {
      if (action === 'delete') {
        await supabase.from('stores').delete().eq('id', sellerId);
      } else {
        await supabase
          .from('stores')
          .update({ is_active: action === 'activate' })
          .eq('id', sellerId);
      }
      refetch();
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Seller Management</h1>
          <p className="text-gray-600">Manage all sellers and their stores</p>
        </div>
        <Badge variant="secondary">
          {sellers?.length || 0} Total Sellers
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sellers</CardTitle>
          <CardDescription>View and manage seller accounts</CardDescription>
          <div className="flex items-center space-x-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by store name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store Info</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellers?.map((seller) => (
                <TableRow key={seller.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{seller.name}</div>
                      <div className="text-sm text-gray-500">@{seller.username}</div>
                    </div>
                  </TableCell>
                  <TableCell>{seller.business_email}</TableCell>
                  <TableCell>
                    <Badge className={getPlanBadgeColor(seller.plan)}>
                      {seller.plan.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{seller.product_count}</TableCell>
                  <TableCell>
                    <Badge variant={seller.is_active ? "default" : "destructive"}>
                      {seller.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(seller.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => window.open(`/store/${seller.username}`, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Store
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleSellerAction(seller.id, seller.is_active ? 'ban' : 'activate')}
                        >
                          {seller.is_active ? (
                            <>
                              <Ban className="h-4 w-4 mr-2" />
                              Ban Seller
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Activate Seller
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleSellerAction(seller.id, 'delete')}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Seller
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerManagement;
