
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface MultiImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  images,
  onImagesChange,
  onFilesChange,
  disabled = false,
  maxImages = 5
}) => {
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const totalImages = images.length + files.length;
    if (totalImages > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate file types
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Please select only image files under 5MB');
    }

    onFilesChange(validFiles);

    // Create preview URLs for immediate display
    const newImageUrls = validFiles.map(file => URL.createObjectURL(file));
    onImagesChange([...images, ...newImageUrls]);

    // Reset input
    event.target.value = '';
  }, [images, onImagesChange, onFilesChange, maxImages]);

  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Product Images</Label>
        <p className="text-xs text-muted-foreground">
          • Minimum 1 image required
        </p>
        <p className="text-xs text-muted-foreground">
          • Maximum {maxImages} images
        </p>
        <p className="text-xs text-muted-foreground">
          • Formats: JPG, PNG, WebP
        </p>
        <p className="text-xs text-muted-foreground">
          • Max size: 5MB per image
        </p>
        <p className="text-xs text-muted-foreground">
          • First image will be used as cover image
        </p>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                <img
                  src={image}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://placehold.co/150x150';
                  }}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2">
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    Cover
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {images.length < maxImages && (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
          <div className="text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="image-upload" className="cursor-pointer">
                <Button type="button" disabled={disabled} asChild>
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    Choose Images
                  </span>
                </Button>
              </label>
              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {images.length > 0 
                ? `Add ${maxImages - images.length} more image${maxImages - images.length !== 1 ? 's' : ''}`
                : `Add up to ${maxImages} images`
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiImageUploader;
