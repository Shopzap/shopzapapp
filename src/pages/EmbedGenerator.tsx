
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmbedGenerator = () => {
  const { toast } = useToast();
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [buttonText, setButtonText] = useState("Buy via WhatsApp");
  const [buttonColor, setButtonColor] = useState("#9b87f5");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  
  const generateCode = () => {
    setIsLoading(true);
    
    // Simulate API request
    setTimeout(() => {
      const code = `
<script>
  (function() {
    // ShopZap WhatsApp Button
    const btn = document.createElement('button');
    btn.innerText = '${buttonText}';
    btn.style.backgroundColor = '${buttonColor}';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.padding = '10px 20px';
    btn.style.borderRadius = '5px';
    btn.style.fontWeight = 'bold';
    btn.style.cursor = 'pointer';
    
    btn.addEventListener('click', function() {
      const productName = document.querySelector('h1')?.innerText || 'Product';
      const productPrice = document.querySelector('.price')?.innerText || '';
      
      // Format WhatsApp message
      const message = \`Hello! I want to order: \${productName} \${productPrice}\`;
      const encodedMessage = encodeURIComponent(message);
      
      // Open WhatsApp with pre-filled message
      window.open(\`https://wa.me/${whatsappNumber}?text=\${encodedMessage}\`);
    });
    
    // Find target element and append button
    document.addEventListener('DOMContentLoaded', function() {
      const targetElement = document.querySelector('.product-form') || 
                           document.querySelector('form') ||
                           document.querySelector('.product');
      
      if (targetElement) {
        const container = document.createElement('div');
        container.style.margin = '15px 0';
        container.appendChild(btn);
        targetElement.appendChild(container);
      }
    });
  })();
</script>
`;
      setGeneratedCode(code);
      setIsLoading(false);
      
      toast({
        title: "Embed code generated!",
        description: "Copy and paste this code into your website",
      });
    }, 1000);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    toast({
      title: "Copied to clipboard!",
      description: "Paste this code into your website's HTML",
    });
  };
  
  return (
    <div className="min-h-screen bg-accent/30 p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <Link to="/onboarding" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={16} className="mr-1" />
          Back to onboarding
        </Link>
        
        <Card>
          <CardHeader>
            <div className="mb-4 font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">ShopZap.io</div>
            <CardTitle className="text-2xl">Create WhatsApp Button</CardTitle>
            <CardDescription>
              Generate an embed code for your existing website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                <Input
                  id="whatsappNumber"
                  type="tel"
                  placeholder="e.g., 919876543210 (with country code)" 
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Include country code without + or spaces (e.g., 91 for India)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="buttonText">Button Text</Label>
                <Input
                  id="buttonText"
                  placeholder="Buy via WhatsApp" 
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="buttonColor">Button Color</Label>
                <div className="flex gap-4">
                  <Input
                    id="buttonColor"
                    type="color"
                    className="w-16 h-10"
                    value={buttonColor}
                    onChange={(e) => setButtonColor(e.target.value)}
                  />
                  <Input
                    value={buttonColor}
                    onChange={(e) => setButtonColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={generateCode} 
                  disabled={!whatsappNumber || isLoading}
                  className="w-full"
                >
                  {isLoading ? "Generating..." : "Generate Embed Code"}
                </Button>
              </div>
              
              {generatedCode && (
                <div className="space-y-2 pt-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="embedCode">Your Embed Code</Label>
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy size={16} className="mr-1" /> Copy
                    </Button>
                  </div>
                  <Textarea
                    id="embedCode"
                    value={generatedCode}
                    readOnly
                    className="font-mono text-sm h-48"
                  />
                  <p className="text-sm text-muted-foreground">
                    Add this code to your product page's HTML, ideally just before the closing {"</body>"} tag.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex-col space-y-4">
            <p className="text-sm text-center text-muted-foreground">
              Need more customization? <Link to="/login" className="text-primary hover:underline">Create an account</Link> to access the full dashboard.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default EmbedGenerator;
