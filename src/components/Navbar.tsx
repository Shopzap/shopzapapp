
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { X, Menu } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="py-4 px-4 md:px-6 lg:px-8 border-b">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">ShopZap<span className="text-foreground">.io</span></span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="font-medium text-foreground hover:text-primary transition-colors">Home</Link>
          <Link to="/pricing" className="font-medium text-foreground hover:text-primary transition-colors">Pricing</Link>
          <Link to="/features" className="font-medium text-foreground hover:text-primary transition-colors">Features</Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/onboarding">Create Store</Link>
          </Button>
        </div>
        
        {/* Mobile menu button */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background z-50 border-b shadow-lg animate-fade-in">
          <div className="container mx-auto flex flex-col py-4 px-4 space-y-4">
            <Link to="/" className="font-medium text-foreground hover:text-primary transition-colors py-2">Home</Link>
            <Link to="/pricing" className="font-medium text-foreground hover:text-primary transition-colors py-2">Pricing</Link>
            <Link to="/features" className="font-medium text-foreground hover:text-primary transition-colors py-2">Features</Link>
            <div className="flex flex-col space-y-2 pt-2">
              <Button variant="outline" asChild className="w-full">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="w-full">
                <Link to="/onboarding">Create Store</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
