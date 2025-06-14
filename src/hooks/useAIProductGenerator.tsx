
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

interface AIGeneratorResponse {
  description: string;
  suggestedPrice?: number;
}

export const useAIProductGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateDescription = async (productName: string): Promise<string | null> => {
    if (!productName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a product name first",
        variant: "destructive"
      });
      return null;
    }

    setIsGenerating(true);
    try {
      // In a real implementation, this would call OpenAI API
      // For now, we'll simulate with a realistic description generator
      const response = await simulateAIDescription(productName);
      
      toast({
        title: "Success",
        description: "AI description generated successfully!",
      });
      
      return response;
    } catch (error) {
      console.error('Error generating description:', error);
      toast({
        title: "Error",
        description: "Failed to generate description. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const simulateAIDescription = async (productName: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate contextual description based on product name
    const descriptions = [
      `Discover the perfect ${productName.toLowerCase()} that combines style, quality, and value. Crafted with attention to detail, this product offers exceptional durability and modern design that fits seamlessly into your lifestyle.`,
      `Experience premium quality with our ${productName.toLowerCase()}. Made from carefully selected materials, this product delivers outstanding performance and lasting satisfaction. Perfect for everyday use or special occasions.`,
      `Transform your experience with this innovative ${productName.toLowerCase()}. Designed with user comfort in mind, it features advanced functionality and elegant aesthetics that make it a must-have addition to your collection.`
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  return {
    generateDescription,
    isGenerating
  };
};
