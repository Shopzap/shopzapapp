
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import React from 'react';

// Import the main Index page content
import Index from "./pages/Index";

const App = () => {
  return (
    <TooltipProvider>
      <Index />
      <Toaster />
      <Sonner />
    </TooltipProvider>
  );
};

export default App;
