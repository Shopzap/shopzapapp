
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + images.length + newFiles.length > maxImages) {
      toast({
        title: "Too many images",
        description: `Maximum ${maxImages} images allowed`,
        variant: "destructive"
      });
      return;
    }

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

      if (!isValidType) {
        invalidFiles.push(`${file.name}: Invalid format`);
      } else if (!isValidSize) {
        invalidFiles.push(`${file.name}: File too large (max 5MB)`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid files",
        description: invalidFiles.join(', '),
        variant: "destructive"
      });
    }

    if (validFiles.length > 0) {
      const updatedFiles = [...newFiles, ...validFiles];
      setNewFiles(updatedFiles);
      onFilesChange(updatedFiles);
    }

    // Reset input
    e.target.value = '';
  }, [images.length, newFiles, maxImages, onFilesChange, toast]);

  const removeExistingImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  const removeNewFile = (index: number) => {
    const updatedFiles = newFiles.filter((_, i) => i !== index);
    setNewFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const totalImages = images.length + newFiles.length;
  const canAddMore = totalImages < maxImages;

  return (
    <div className="space-y-4">
      <Label>Product Images ({totalImages}/{maxImages})</Label>
      
      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Existing Images */}
        {images.map((imageUrl, index) => (
          <div key={`existing-${index}`} className="relative group">
            <div className="aspect-square border rounded-lg overflow-hidden bg-gray-50">
              <img
                src={imageUrl}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-100 group-hover:opacity-100 transition-opacity"
                onClick={() => removeExistingImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            {index === 0 && (
              <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                Cover
              </div>
            )}
          </div>
        ))}

        {/* New Files Preview */}
        {newFiles.map((file, index) => (
          <div key={`new-${index}`} className="relative group">
            <div className="aspect-square border rounded-lg overflow-hidden bg-gray-50">
              <img
                src={URL.createObjectURL(file)}
                alt={`New image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-100 group-hover:opacity-100 transition-opacity"
                onClick={() => removeNewFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            {images.length === 0 && index === 0 && (
              <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                Cover
              </div>
            )}
          </div>
        ))}

        {/* Upload Button */}
        {canAddMore && !disabled && (
          <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500 text-center px-2">
              Add Images
            </span>
          </label>
        )}
      </div>

      {/* Requirements */}
      <div className="text-sm text-gray-500">
        <p>• Minimum 1 image required</p>
        <p>• Maximum {maxImages} images</p>
        <p>• Formats: JPG, PNG, WebP</p>
        <p>• Max size: 5MB per image</p>
        <p>• First image will be used as cover image</p>
      </div>
    </div>
  );
};

export default MultiImageUploader;
