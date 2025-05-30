
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
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
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] max-h-[90vh] flex flex-col">
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
