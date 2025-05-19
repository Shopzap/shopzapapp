
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Onboarding = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  
  const handleSelection = (choice: string) => {
    setSelected(choice);
  };
  
  const handleContinue = () => {
    if (selected === 'yes') {
      navigate('/embed-generator');
    } else if (selected === 'no') {
      navigate('/store-builder');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-accent/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">ShopZap.io</div>
          <CardTitle className="text-2xl">Welcome to ShopZap!</CardTitle>
          <CardDescription className="text-base">
            Let's get started with setting up your WhatsApp store
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-medium text-center mb-4">Do you have an existing website?</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer border hover:border-primary transition-colors ${selected === 'yes' ? 'border-primary bg-accent/20' : ''}`}
              onClick={() => handleSelection('yes')}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Yes</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <CardDescription>
                  I want to add a WhatsApp checkout button to my existing website
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer border hover:border-primary transition-colors ${selected === 'no' ? 'border-primary bg-accent/20' : ''}`}
              onClick={() => handleSelection('no')}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-lg">No</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <CardDescription>
                  I need a complete store that I can share with my customers
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            disabled={!selected} 
            onClick={handleContinue}
          >
            Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Onboarding;
