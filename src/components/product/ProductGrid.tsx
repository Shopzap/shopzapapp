
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EditProductForm from './EditProductForm';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';
import DeleteProductDialog from './DeleteProductDialog';
import { Product } from './types';

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
  const { toast } = useToast();

  const handleDeleteProduct = async () => {
    if (!deleteConfirmProduct) return;
    
    try {
      setIsDeleting(true);
      
      // First delete any associated variants if it's a variant product
      if (deleteConfirmProduct.product_type === 'variant') {
        const { error: variantError } = await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', deleteConfirmProduct.id);
          
        if (variantError) {
          console.error('Error deleting variants:', variantError);
          throw variantError;
        }
      }
      
      // Then delete the product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteConfirmProduct.id);
        
      if (error) throw error;
      
      toast({
        title: "Product deleted",
        description: "Your product has been deleted successfully",
      });
      
      onDelete();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error deleting product",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmProduct(null);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setShowEditDialog(true);
  };

  const renderSkeletons = () => {
    return Array(4).fill(0).map((_, index) => (
      <ProductSkeleton key={index} />
    ));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {renderSkeletons()}
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

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard 
            key={product.id}
            product={product}
            onEdit={handleEditClick}
            onDelete={setDeleteConfirmProduct}
          />
        ))}
      </div>

      {/* Edit Product Dialog */}
      {editingProduct && (
        <EditProductForm 
          product={editingProduct} 
          open={showEditDialog}
          onSuccess={() => {
            setShowEditDialog(false);
            onUpdate();
          }}
          onCancel={() => setShowEditDialog(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteProductDialog
        productName={deleteConfirmProduct?.name || ''}
        isOpen={!!deleteConfirmProduct}
        isDeleting={isDeleting}
        onClose={() => setDeleteConfirmProduct(null)}
        onConfirm={handleDeleteProduct}
      />
    </>
  );
};

export default ProductGrid;
