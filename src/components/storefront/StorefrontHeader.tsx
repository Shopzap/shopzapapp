
import React from "react";
import { Tables } from "@/integrations/supabase/types";

interface StorefrontHeaderProps {
  store: Tables<"stores">;
}

const StorefrontHeader: React.FC<StorefrontHeaderProps> = ({ store }) => {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-6 flex items-center gap-4">
        {store.logo_image ? (
          <img 
            src={store.logo_image} 
            alt={store.name} 
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {store.name.substring(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">{store.name}</h1>
          {store.tagline && (
            <p className="text-muted-foreground">{store.tagline}</p>
          )}
        </div>
      </div>
    </header>
  );
};

export default StorefrontHeader;
