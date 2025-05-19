
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-accent/30 p-4">
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 gradient-text">404</h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8">Oops! Page not found</p>
        <Button asChild size="lg">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
