
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { v4 as uuidv4 } from 'uuid';
import { ProductVariant } from './types';

interface VariantManagerProps {
  initialVariants?: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
  basePrice: string;
}

const VariantManager: React.FC<VariantManagerProps> = ({ 
  initialVariants = [], 
  onVariantsChange, 
  basePrice 
}) => {
  const [options, setOptions] = useState<{ id: string; name: string; values: string[] }[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants);
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionValues, setNewOptionValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialVariants.length > 0 && options.length === 0) {
      const newOptions: { [key: string]: Set<string> } = {};
      initialVariants.forEach(variant => {
        Object.entries(variant.options).forEach(([key, value]) => {
          if (!newOptions[key]) {
            newOptions[key] = new Set();
          }
          newOptions[key].add(value);
        });
      });
      setOptions(
        Object.entries(newOptions).map(([name, values]) => ({
          id: uuidv4(),
          name,
          values: Array.from(values),
        }))
      );
    }
    setVariants(initialVariants);
  }, [initialVariants]);

  const generateVariants = () => {
    if (options.length === 0) {
      setVariants([]);
      return;
    }

    const allOptionsHaveValues = options.every(opt => opt.values.length > 0);
    if (!allOptionsHaveValues) {
      setVariants([]);
      return;
    }

    const optionValues = options.map(opt => opt.values);
    const keys = options.map(opt => opt.name);
    
    const combinations = optionValues.reduce((acc, values) => {
        if (acc.length === 0) return values.map(v => [v]);
        return acc.flatMap(combo => values.map(value => [...combo, value]));
    }, [] as string[][]);

    const newVariants = combinations.map(combo => {
      const comboOptions = combo.reduce((acc, value, index) => {
        acc[keys[index]] = value;
        return acc;
      }, {} as { [key: string]: string });

      const existingVariant = variants.find(v => {
        if (!v.options) return false;
        const vKeys = Object.keys(v.options);
        const comboKeys = Object.keys(comboOptions);
        if (vKeys.length !== comboKeys.length) return false;
        return comboKeys.every(key => v.options[key] === comboOptions[key]);
      });

      return {
        id: existingVariant?.id || uuidv4(),
        price: existingVariant?.price ?? (parseFloat(basePrice) || 0),
        inventory_count: existingVariant?.inventory_count ?? 0,
        sku: existingVariant?.sku || '',
        options: comboOptions,
      };
    });
    
    setVariants(newVariants);
  };
  
  useEffect(() => {
    generateVariants();
  }, [options, basePrice]);

  useEffect(() => {
    onVariantsChange(variants);
  }, [variants, onVariantsChange]);

  const addOption = () => {
    if (newOptionName.trim() && !options.some(opt => opt.name.toLowerCase() === newOptionName.trim().toLowerCase())) {
      setOptions([...options, { id: uuidv4(), name: newOptionName.trim(), values: [] }]);
      setNewOptionName('');
    }
  };

  const removeOption = (id: string) => {
    setOptions(options.filter(opt => opt.id !== id));
  };

  const addOptionValue = (optionId: string) => {
    const value = newOptionValues[optionId]?.trim();
    if (!value) return;

    setOptions(options.map(opt => {
      if (opt.id === optionId && !opt.values.some(v => v.toLowerCase() === value.toLowerCase())) {
        return { ...opt, values: [...opt.values, value] };
      }
      return opt;
    }));
    setNewOptionValues({ ...newOptionValues, [optionId]: '' });
  };

  const removeOptionValue = (optionId: string, value: string) => {
    setOptions(options.map(opt => {
      if (opt.id === optionId) {
        return { ...opt, values: opt.values.filter(v => v !== value) };
      }
      return opt;
    }));
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: string | number) => {
    const updatedVariants = [...variants];
    const numericFields = ['price', 'inventory_count'];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: numericFields.includes(field) ? parseFloat(value.toString()) || 0 : value
    };
    setVariants(updatedVariants);
  };

  const variantDisplayName = (variant: ProductVariant) => {
    return Object.values(variant.options).join(' / ');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 p-4 border rounded-lg">
        <h3 className="font-medium">Variant Options</h3>
        {options.map(option => (
          <div key={option.id} className="p-3 border rounded-md space-y-2">
            <div className="flex justify-between items-center">
              <Label>{option.name}</Label>
              <Button variant="ghost" size="sm" onClick={() => removeOption(option.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2 items-center">
              <Input
                placeholder={`Add value for ${option.name}`}
                value={newOptionValues[option.id] || ''}
                onChange={e => setNewOptionValues({ ...newOptionValues, [option.id]: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOptionValue(option.id))}
              />
              <Button type="button" onClick={() => addOptionValue(option.id)}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {option.values.map(value => (
                <Badge key={value} variant="secondary">
                  {value}
                  <button type="button" onClick={() => removeOptionValue(option.id, value)} className="ml-2">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <Input
            placeholder="Add new option (e.g., Color, Size)"
            value={newOptionName}
            onChange={e => setNewOptionName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
          />
          <Button type="button" onClick={addOption}>
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </div>
      </div>
      
      {options.length > 0 && variants.length === 0 && (
        <div className="p-4 border border-dashed rounded-lg text-center text-sm text-muted-foreground bg-accent/40">
          <p>Variants will be generated automatically once you add values for each option.</p>
          <p className="text-xs">For example, for a "Color" option, add values like "Red", "Blue", etc.</p>
        </div>
      )}

      {variants.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Variant Pricing & Inventory ({variants.length} combinations)</h3>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variant</TableHead>
                  <TableHead>Price (₹)</TableHead>
                  <TableHead>Inventory</TableHead>
                  <TableHead>SKU</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant, index) => (
                  <TableRow key={`${index}-${Object.values(variant.options).join('-')}`}>
                    <TableCell className="font-medium">{variantDisplayName(variant)}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={variant.price}
                        onChange={e => handleVariantChange(index, 'price', e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={variant.inventory_count}
                        onChange={e => handleVariantChange(index, 'inventory_count', e.target.value)}
                        placeholder="0"
                        min="0"
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        value={variant.sku || ''}
                        onChange={e => handleVariantChange(index, 'sku', e.target.value)}
                        placeholder="Auto-generated"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantManager;
