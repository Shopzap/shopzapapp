
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import EditProductForm from './EditProductForm';

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  sku?: string;
  inventory_count?: number;
  status: string;
};

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  onDelete: () => void;
  onUpdate: () => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  isLoading,
  onDelete,
  onUpdate
}) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteProduct = async () => {
    if (!deleteConfirmProduct) return;
    
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteConfirmProduct.id);
        
      if (error) throw error;
      onDelete();
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmProduct(null);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setShowEditDialog(true);
  };

  const renderSkeleton = () => {
    return Array(4).fill(0).map((_, index) => (
      <Card key={index} className="overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <CardContent className="p-4">
          <Skeleton className="h-4 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </CardContent>
        <CardFooter className="p-4 pt-0 justify-between">
          <Skeleton className="h-4 w-1/4" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </CardFooter>
      </Card>
    ));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {renderSkeleton()}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg">
        <h3 className="text-xl font-medium mb-2">No products found</h3>
        <p className="text-muted-foreground mb-6">Start adding products to your store</p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="relative h-48 bg-accent flex items-center justify-center overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-muted-foreground">No image</div>
              )}
              <Badge 
                className="absolute top-2 right-2"
                variant={product.status === 'active' ? 'default' : 'secondary'}
              >
                {product.status === 'active' ? 'Active' : 'Draft'}
              </Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium truncate">{product.name}</h3>
              <p className="text-primary font-bold">{formatPrice(product.price)}</p>
              {product.category && (
                <Badge variant="outline" className="mt-2">
                  {product.category}
                </Badge>
              )}
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
              {product.inventory_count !== undefined && (
                <span className="text-sm text-muted-foreground">
                  {product.inventory_count > 0 
                    ? `${product.inventory_count} in stock` 
                    : 'Out of stock'}
                </span>
              )}
              <div className="flex gap-2">
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={() => handleEditClick(product)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteConfirmProduct(product)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <EditProductForm 
              product={editingProduct} 
              onSuccess={() => {
                setShowEditDialog(false);
                onUpdate();
              }}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={!!deleteConfirmProduct} 
        onOpenChange={(open) => !open && setDeleteConfirmProduct(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product "{deleteConfirmProduct?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProductGrid;
