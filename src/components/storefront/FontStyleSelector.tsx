
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FontStyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const FONT_OPTIONS = [
  // Modern Sans-Serif (Clean & Ecommerce Friendly)
  { value: 'Inter', label: 'Inter', category: 'Modern Sans-Serif', googleFont: 'Inter:wght@300;400;500;600;700' },
  { value: 'Poppins', label: 'Poppins', category: 'Modern Sans-Serif', googleFont: 'Poppins:wght@300;400;500;600;700' },
  { value: 'Montserrat', label: 'Montserrat', category: 'Modern Sans-Serif', googleFont: 'Montserrat:wght@300;400;500;600;700' },
  { value: 'Lato', label: 'Lato', category: 'Modern Sans-Serif', googleFont: 'Lato:wght@300;400;700' },
  { value: 'Rubik', label: 'Rubik', category: 'Modern Sans-Serif', googleFont: 'Rubik:wght@300;400;500;600;700' },
  { value: 'DM Sans', label: 'DM Sans', category: 'Modern Sans-Serif', googleFont: 'DM+Sans:wght@300;400;500;600;700' },
  { value: 'Manrope', label: 'Manrope', category: 'Modern Sans-Serif', googleFont: 'Manrope:wght@300;400;500;600;700' },
  { value: 'Nunito', label: 'Nunito', category: 'Modern Sans-Serif', googleFont: 'Nunito:wght@300;400;500;600;700' },
  { value: 'Mulish', label: 'Mulish', category: 'Modern Sans-Serif', googleFont: 'Mulish:wght@300;400;500;600;700' },
  { value: 'Ubuntu', label: 'Ubuntu', category: 'Modern Sans-Serif', googleFont: 'Ubuntu:wght@300;400;500;700' },
  
  // Premium Serif (Great for Home, Decor, Handmade, Jewelry)
  { value: 'Playfair Display', label: 'Playfair Display', category: 'Premium Serif', googleFont: 'Playfair+Display:wght@400;500;600;700' },
  { value: 'Merriweather', label: 'Merriweather', category: 'Premium Serif', googleFont: 'Merriweather:wght@300;400;700' },
  { value: 'EB Garamond', label: 'EB Garamond', category: 'Premium Serif', googleFont: 'EB+Garamond:wght@400;500;600;700' },
  
  // Fun / Kids / Handmade Products
  { value: 'Fredoka', label: 'Fredoka', category: 'Fun & Creative', googleFont: 'Fredoka:wght@300;400;500;600;700' },
  { value: 'Pacifico', label: 'Pacifico', category: 'Fun & Creative', googleFont: 'Pacifico' },
  { value: 'Baloo 2', label: 'Baloo 2', category: 'Fun & Creative', googleFont: 'Baloo+2:wght@400;500;600;700' },
];

// Function to load Google Font dynamically
const loadGoogleFont = (fontUrl: string) => {
  const existingLink = document.querySelector(`link[href*="${fontUrl}"]`);
  if (existingLink) return;

  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${fontUrl}&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
};

const FontStyleSelector: React.FC<FontStyleSelectorProps> = ({ value, onChange }) => {
  const selectedFont = FONT_OPTIONS.find(font => font.value === value);
  
  // Load the selected font
  React.useEffect(() => {
    if (selectedFont?.googleFont) {
      loadGoogleFont(selectedFont.googleFont);
    }
  }, [selectedFont]);

  const handleFontChange = (newFont: string) => {
    const font = FONT_OPTIONS.find(f => f.value === newFont);
    if (font?.googleFont) {
      loadGoogleFont(font.googleFont);
    }
    onChange(newFont);
  };

  // Group fonts by category
  const fontsByCategory = FONT_OPTIONS.reduce((acc, font) => {
    if (!acc[font.category]) {
      acc[font.category] = [];
    }
    acc[font.category].push(font);
    return acc;
  }, {} as Record<string, typeof FONT_OPTIONS>);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="font-style">Select Font Style</Label>
        <Select value={value} onValueChange={handleFontChange}>
          <SelectTrigger>
            <SelectValue 
              placeholder="Select a font" 
              style={{ fontFamily: `${value}, sans-serif` }}
            />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(fontsByCategory).map(([category, fonts]) => (
              <div key={category}>
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {category}
                </div>
                {fonts.map((font) => (
                  <SelectItem 
                    key={font.value} 
                    value={font.value}
                    style={{ fontFamily: `${font.value}, sans-serif` }}
                    onSelect={() => loadGoogleFont(font.googleFont)}
                  >
                    {font.label}
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Font Preview */}
      {value && (
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-white">
            <p className="text-sm text-gray-600 mb-3">Live Preview:</p>
            <div style={{ fontFamily: `${value}, sans-serif` }} className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">Your Store Name</h3>
              <p className="text-lg text-gray-600">Discover amazing products</p>
              <p className="text-base text-gray-700">This is how your product descriptions will look with {value} font.</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-lg font-semibold text-gray-900">₹999</span>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium"
                  style={{ fontFamily: `${value}, sans-serif` }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
          
          {selectedFont && (
            <div className="text-xs text-gray-500">
              <span className="font-medium">Category:</span> {selectedFont.category} • 
              <span className="font-medium"> Ideal for:</span> {
                selectedFont.category === 'Modern Sans-Serif' ? 'E-commerce, Tech, Fashion' :
                selectedFont.category === 'Premium Serif' ? 'Luxury, Home Decor, Jewelry' :
                'Kids Products, Handmade, Creative Brands'
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FontStyleSelector;
