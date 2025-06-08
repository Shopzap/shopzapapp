
import React from 'react';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface ColorPalette {
  id: string;
  name: string;
  description: string;
  primary: string;
  accent: string;
  cta: string;
  emoji: string;
}

interface ColorPaletteSelectorProps {
  selectedPalette: string;
  onPaletteChange: (palette: ColorPalette) => void;
}

const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'urban-modern',
    name: 'Urban Modern',
    description: 'Clean, professional, versatile',
    primary: '#111827',
    accent: '#F9FAFB',
    cta: '#6366F1',
    emoji: '🖤'
  },
  {
    id: 'trust-blue',
    name: 'Trust Blue',
    description: 'SaaS & D2C brands',
    primary: '#1E40AF',
    accent: '#E0F2FE',
    cta: '#3B82F6',
    emoji: '🟦'
  },
  {
    id: 'warm-bold',
    name: 'Warm Bold',
    description: 'Energetic, attention-grabbing',
    primary: '#EA580C',
    accent: '#FFEDD5',
    cta: '#F97316',
    emoji: '🟧'
  },
  {
    id: 'organic-calm',
    name: 'Organic Calm',
    description: 'Natural, eco-friendly brands',
    primary: '#166534',
    accent: '#DCFCE7',
    cta: '#10B981',
    emoji: '🟩'
  },
  {
    id: 'luxe-feminine',
    name: 'Luxe Feminine',
    description: 'Beauty, fashion, lifestyle',
    primary: '#BE185D',
    accent: '#FCE7F3',
    cta: '#F472B6',
    emoji: '🎀'
  },
  {
    id: 'black-white',
    name: 'Black & White',
    description: 'Minimalist, high contrast',
    primary: '#000000',
    accent: '#FFFFFF',
    cta: '#FF3C00',
    emoji: '⚫'
  },
  {
    id: 'pastel-cream',
    name: 'Pastel Cream',
    description: 'Soft, warm, inviting',
    primary: '#FBBF24',
    accent: '#FEF3C7',
    cta: '#F59E0B',
    emoji: '🟨'
  }
];

const ColorPaletteSelector: React.FC<ColorPaletteSelectorProps> = ({
  selectedPalette,
  onPaletteChange
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">Color Palettes</Label>
        <p className="text-sm text-gray-600 mt-1">Choose a professional color scheme for your store</p>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {COLOR_PALETTES.map((palette) => (
          <Card
            key={palette.id}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedPalette === palette.id 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onPaletteChange(palette)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{palette.emoji}</span>
                <div>
                  <h4 className="font-medium text-sm">{palette.name}</h4>
                  <p className="text-xs text-gray-500">{palette.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Color swatches */}
                <div className="flex space-x-1">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-200"
                    style={{ backgroundColor: palette.primary }}
                    title="Primary Color"
                  />
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-200"
                    style={{ backgroundColor: palette.accent }}
                    title="Accent Color"
                  />
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-200"
                    style={{ backgroundColor: palette.cta }}
                    title="CTA Color"
                  />
                </div>
                
                {selectedPalette === palette.id && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Color Preview */}
      {selectedPalette && (
        <div className="mt-6">
          <Label className="text-sm font-medium mb-3 block">Preview</Label>
          <div className="border rounded-lg p-4 bg-white">
            {COLOR_PALETTES.filter(p => p.id === selectedPalette).map(palette => (
              <div key={palette.id} style={{ color: palette.primary }}>
                <h3 className="text-lg font-bold mb-2">Your Store Name</h3>
                <p className="text-sm mb-4" style={{ color: `${palette.primary}99` }}>
                  Discover amazing products at great prices
                </p>
                <div 
                  className="p-3 rounded-md text-center"
                  style={{ backgroundColor: palette.accent }}
                >
                  <span className="text-xs" style={{ color: palette.primary }}>
                    Featured Product Section
                  </span>
                </div>
                <button 
                  className="mt-3 px-4 py-2 rounded-md text-white text-sm font-medium"
                  style={{ backgroundColor: palette.cta }}
                >
                  Shop Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { COLOR_PALETTES };
export default ColorPaletteSelector;
