
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FontStyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const FONT_OPTIONS = [
  { value: 'Poppins', label: 'Poppins', className: 'font-poppins' },
  { value: 'Roboto', label: 'Roboto', className: 'font-roboto' },
  { value: 'Playfair Display', label: 'Playfair Display', className: 'font-playfair' },
  { value: 'Lato', label: 'Lato', className: 'font-lato' },
  { value: 'Mukta', label: 'Mukta', className: 'font-mukta' },
];

const FontStyleSelector: React.FC<FontStyleSelectorProps> = ({ value, onChange }) => {
  return (
    <div>
      <Label htmlFor="font-style">Select Font Style</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a font" />
        </SelectTrigger>
        <SelectContent>
          {FONT_OPTIONS.map((font) => (
            <SelectItem key={font.value} value={font.value}>
              <span className={font.className}>{font.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Font Preview */}
      {value && (
        <div className="mt-4 p-4 border rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Preview:</p>
          <div className={`font-${value.toLowerCase().replace(' ', '')}`}>
            <h3 className="text-lg font-semibold mb-2">Sample Store Name</h3>
            <p className="text-gray-700">This is how your store text will look with {value} font.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FontStyleSelector;
