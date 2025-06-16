
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ProductVariant } from './types';

interface VariantSelectorProps {
  variants: ProductVariant[];
  onVariantSelect: (variant: ProductVariant | null) => void;
  selectedVariant?: ProductVariant | null;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  onVariantSelect,
  selectedVariant
}) => {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [availableOptions, setAvailableOptions] = useState<Record<string, string[]>>({});

  // Extract all unique options from variants
  useEffect(() => {
    if (!variants || variants.length === 0) return;

    const optionTypes: Record<string, Set<string>> = {};
    
    variants.forEach(variant => {
      if (variant.options) {
        Object.entries(variant.options).forEach(([key, value]) => {
          if (!optionTypes[key]) {
            optionTypes[key] = new Set();
          }
          optionTypes[key].add(value);
        });
      }
    });

    const options: Record<string, string[]> = {};
    Object.entries(optionTypes).forEach(([key, valueSet]) => {
      options[key] = Array.from(valueSet);
    });

    setAvailableOptions(options);
  }, [variants]);

  // Find matching variant when selections change
  useEffect(() => {
    const optionKeys = Object.keys(availableOptions);
    const hasAllSelections = optionKeys.every(key => selections[key]);

    if (hasAllSelections && optionKeys.length > 0) {
      const matchingVariant = variants.find(variant => {
        if (!variant.options) return false;
        return optionKeys.every(key => variant.options[key] === selections[key]);
      });
      onVariantSelect(matchingVariant || null);
    } else {
      onVariantSelect(null);
    }
  }, [selections, variants, availableOptions, onVariantSelect]);

  const handleSelectionChange = (optionType: string, value: string) => {
    setSelections(prev => ({
      ...prev,
      [optionType]: value
    }));
  };

  const getAvailableValues = (optionType: string): string[] => {
    if (Object.keys(selections).length === 0) {
      return availableOptions[optionType] || [];
    }

    // Filter available values based on current selections
    const otherSelections = { ...selections };
    delete otherSelections[optionType];

    const availableVariants = variants.filter(variant => {
      if (!variant.options) return false;
      return Object.entries(otherSelections).every(([key, value]) => 
        variant.options[key] === value
      );
    });

    const availableValues = new Set<string>();
    availableVariants.forEach(variant => {
      if (variant.options && variant.options[optionType]) {
        availableValues.add(variant.options[optionType]);
      }
    });

    return Array.from(availableValues);
  };

  const isValueAvailable = (optionType: string, value: string): boolean => {
    const testSelections = { ...selections, [optionType]: value };
    return variants.some(variant => {
      if (!variant.options) return false;
      return Object.entries(testSelections).every(([key, val]) => 
        variant.options[key] === val
      );
    });
  };

  if (!variants || variants.length === 0) {
    return null;
  }

  const optionTypes = Object.keys(availableOptions);

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm">Select Options:</h3>
      
      {optionTypes.map(optionType => (
        <div key={optionType} className="space-y-2">
          <Label className="text-sm font-medium capitalize">{optionType}</Label>
          <Select 
            value={selections[optionType] || ''} 
            onValueChange={(value) => handleSelectionChange(optionType, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Choose ${optionType.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {getAvailableValues(optionType).map(value => (
                <SelectItem 
                  key={value} 
                  value={value}
                  disabled={!isValueAvailable(optionType, value)}
                >
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}

      {selectedVariant && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="secondary" className="mb-2">
                {Object.values(selectedVariant.options).join(' • ')}
              </Badge>
              <p className="text-lg font-semibold">₹{selectedVariant.price}</p>
              <p className="text-sm text-muted-foreground">
                {selectedVariant.inventory_count > 0 
                  ? `${selectedVariant.inventory_count} in stock` 
                  : 'Out of stock'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {Object.keys(selections).length > 0 && !selectedVariant && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            This combination is not available. Please try different options.
          </p>
        </div>
      )}
    </div>
  );
};

export default VariantSelector;
