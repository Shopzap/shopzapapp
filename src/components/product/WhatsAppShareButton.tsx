
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppShareButtonProps {
  productName: string;
  productPrice: number;
  className?: string;
}

const WhatsAppShareButton: React.FC<WhatsAppShareButtonProps> = ({ 
  productName, 
  productPrice, 
  className = '' 
}) => {
  const { toast } = useToast();
  const currentUrl = window.location.href;
  
  const handleWhatsAppShare = () => {
    const shareText = `Hey! Check out "${productName}" for ₹${productPrice.toLocaleString()} on ShopZap`;
    const message = `${shareText} - ${currentUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    
    toast({
      title: "Opening WhatsApp",
      description: "WhatsApp should open with your product link",
    });
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleWhatsAppShare}
      className={`text-green-600 border-green-600 hover:bg-green-50 ${className}`}
    >
      <MessageCircle className="mr-2 h-4 w-4" />
      Share on WhatsApp
    </Button>
  );
};

export default WhatsAppShareButton;
