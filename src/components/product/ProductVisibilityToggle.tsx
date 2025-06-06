
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

interface ProductVisibilityToggleProps {
  isPublished: boolean;
  onToggle: (published: boolean) => void;
  disabled?: boolean;
}

const ProductVisibilityToggle: React.FC<ProductVisibilityToggleProps> = ({
  isPublished,
  onToggle,
  disabled = false
}) => {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        {isPublished ? (
          <Eye className="h-4 w-4 text-green-600" />
        ) : (
          <EyeOff className="h-4 w-4 text-gray-400" />
        )}
        <Label htmlFor="product-visibility" className="text-sm font-medium">
          {isPublished ? 'Visible in store' : 'Hidden from store'}
        </Label>
      </div>
      <Switch
        id="product-visibility"
        checked={isPublished}
        onCheckedChange={onToggle}
        disabled={disabled}
      />
    </div>
  );
};

export default ProductVisibilityToggle;
