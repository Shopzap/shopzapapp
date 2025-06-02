
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface StorefrontFiltersProps {
  priceRange: [number, number];
  maxPrice: number;
  onPriceChange: (range: [number, number]) => void;
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  availableCategories: string[];
  onClearFilters: () => void;
}

const StorefrontFilters: React.FC<StorefrontFiltersProps> = ({
  priceRange,
  maxPrice,
  onPriceChange,
  selectedCategories,
  onCategoryChange,
  availableCategories,
  onClearFilters
}) => {
  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Price Range */}
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-3 block">
              Price Range
            </Label>
            <div className="px-2">
              <Slider
                value={priceRange}
                onValueChange={(value) => onPriceChange(value as [number, number])}
                max={maxPrice}
                min={0}
                step={10}
                className="mb-3"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          {availableCategories.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">
                Categories
              </Label>
              <div className="space-y-3">
                {availableCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    />
                    <Label
                      htmlFor={category}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="w-full"
          >
            Clear All Filters
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorefrontFilters;
