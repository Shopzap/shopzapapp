
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EmbedButton = () => {
  const { toast } = useToast();
  const [buttonText, setButtonText] = useState('Shop on WhatsApp');
  const [buttonColor, setButtonColor] = useState('#25D366');
  const [buttonSize, setButtonSize] = useState('medium');
  const [storeName, setStoreName] = useState('');

  const generateEmbedCode = () => {
    const sizeStyles = {
      small: 'padding: 8px 16px; font-size: 14px;',
      medium: 'padding: 12px 24px; font-size: 16px;',
      large: 'padding: 16px 32px; font-size: 18px;'
    };

    return `<a href="https://shopzap.io/store/${storeName}" 
   style="background-color: ${buttonColor}; color: white; text-decoration: none; border-radius: 8px; ${sizeStyles[buttonSize]} display: inline-block; font-family: Arial, sans-serif; font-weight: bold; transition: all 0.3s ease;"
   onmouseover="this.style.opacity='0.9'"
   onmouseout="this.style.opacity='1'"
   target="_blank">
  ${buttonText}
</a>`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-background to-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Embed WhatsApp Button
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Add a "Shop on WhatsApp" button to any website and drive traffic to your ShopZap store
              </p>
            </div>
          </div>
        </section>

        {/* Button Generator */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Configuration Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>Customize Your Button</CardTitle>
                  <CardDescription>
                    Configure your WhatsApp shopping button
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input
                      id="storeName"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Enter your store name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="buttonText">Button Text</Label>
                    <Input
                      id="buttonText"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="Shop on WhatsApp"
                    />
                  </div>

                  <div>
                    <Label htmlFor="buttonColor">Button Color</Label>
                    <Input
                      id="buttonColor"
                      type="color"
                      value={buttonColor}
                      onChange={(e) => setButtonColor(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="buttonSize">Button Size</Label>
                    <Select value={buttonSize} onValueChange={setButtonSize}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Preview and Code */}
              <div className="space-y-6">
                {/* Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>
                      See how your button will look
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/30 p-8 rounded-lg text-center">
                      <div
                        style={{
                          backgroundColor: buttonColor,
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '8px',
                          padding: buttonSize === 'small' ? '8px 16px' : 
                                  buttonSize === 'medium' ? '12px 24px' : '16px 32px',
                          fontSize: buttonSize === 'small' ? '14px' : 
                                   buttonSize === 'medium' ? '16px' : '18px',
                          display: 'inline-block',
                          fontFamily: 'Arial, sans-serif',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        {buttonText}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Embed Code */}
                <Card>
                  <CardHeader>
                    <CardTitle>Embed Code</CardTitle>
                    <CardDescription>
                      Copy this HTML code to your website
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <Textarea
                        value={generateEmbedCode()}
                        readOnly
                        rows={8}
                        className="font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={copyToClipboard}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Instructions */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How to Use</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Customize</h3>
                <p className="text-muted-foreground">
                  Configure your button text, color, and size using the form above
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Copy Code</h3>
                <p className="text-muted-foreground">
                  Copy the generated HTML embed code to your clipboard
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Embed</h3>
                <p className="text-muted-foreground">
                  Paste the code into your website where you want the button to appear
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default EmbedButton;
