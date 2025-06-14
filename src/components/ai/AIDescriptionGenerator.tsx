
import React from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Loader } from 'lucide-react';
import { useAIProductGenerator } from '@/hooks/useAIProductGenerator';

interface AIDescriptionGeneratorProps {
  productName: string;
  onDescriptionGenerated: (description: string) => void;
  disabled?: boolean;
}

export const AIDescriptionGenerator: React.FC<AIDescriptionGeneratorProps> = ({
  productName,
  onDescriptionGenerated,
  disabled = false
}) => {
  const { generateDescription, isGenerating } = useAIProductGenerator();

  const handleGenerate = async () => {
    const description = await generateDescription(productName);
    if (description) {
      onDescriptionGenerated(description);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={disabled || isGenerating || !productName.trim()}
      className="flex items-center gap-2"
    >
      {isGenerating ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {isGenerating ? 'Generating...' : '🪄 Generate with AI'}
    </Button>
  );
};
