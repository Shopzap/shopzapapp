
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader, ExternalLink, Check } from 'lucide-react';

interface StoreSlugEditorProps {
  storeId: string;
  currentSlug: string;
  onSlugUpdate: (newSlug: string) => void;
}

const StoreSlugEditor: React.FC<StoreSlugEditorProps> = ({ 
  storeId, 
  currentSlug, 
  onSlugUpdate 
}) => {
  const [newSlug, setNewSlug] = useState(currentSlug);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const { toast } = useToast();

  const validateSlug = (slug: string): boolean => {
    const slugRegex = /^[a-z0-9-]+$/;
    return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 30;
  };

  const sanitizeSlug = (input: string): string => {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  const checkSlugAvailability = async (slug: string) => {
    if (!validateSlug(slug) || slug === currentSlug) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        console.error('Error checking slug availability:', error);
        setIsAvailable(null);
        return;
      }

      setIsAvailable(!data);
    } catch (error) {
      console.error('Exception checking slug availability:', error);
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeSlug(e.target.value);
    setNewSlug(sanitized);
    
    // Debounced availability check
    const timeoutId = setTimeout(() => {
      checkSlugAvailability(sanitized);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleUpdate = async () => {
    if (!validateSlug(newSlug)) {
      toast({
        title: "Invalid slug",
        description: "Slug must be 3-30 characters long and contain only lowercase letters, numbers, and hyphens.",
        variant: "destructive"
      });
      return;
    }

    if (isAvailable === false) {
      toast({
        title: "Slug not available",
        description: "This slug is already taken. Please choose a different one.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('stores')
        .update({ slug: newSlug })
        .eq('id', storeId);

      if (error) {
        throw error;
      }

      toast({
        title: "Store URL updated!",
        description: `Your store is now available at shopzap.io/store/${newSlug}`,
      });

      onSlugUpdate(newSlug);
    } catch (error: any) {
      console.error('Error updating slug:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update store URL. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const previewUrl = `shopzap.io/store/${newSlug}`;
  const hasChanged = newSlug !== currentSlug;
  const isValid = validateSlug(newSlug);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store URL</CardTitle>
        <CardDescription>
          Customize your store's public URL for sharing on Instagram, WhatsApp, and other platforms.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="slug">Custom Store URL</Label>
          <div className="flex">
            <div className="bg-muted px-3 py-2 rounded-l-md border-y border-l border-input text-muted-foreground text-sm">
              shopzap.io/store/
            </div>
            <Input
              id="slug"
              className="rounded-l-none"
              placeholder="your-store-name"
              value={newSlug}
              onChange={handleSlugChange}
              disabled={isLoading}
            />
          </div>
          
          {/* Validation feedback */}
          {newSlug && (
            <div className="flex items-center gap-2 text-sm">
              {isChecking ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground">Checking availability...</span>
                </>
              ) : !isValid ? (
                <span className="text-destructive">
                  Must be 3-30 characters, lowercase letters, numbers, and hyphens only
                </span>
              ) : isAvailable === true ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Available!</span>
                </>
              ) : isAvailable === false ? (
                <span className="text-destructive">This URL is already taken</span>
              ) : null}
            </div>
          )}
        </div>

        {/* Preview */}
        {isValid && (
          <div className="p-3 bg-muted rounded-md">
            <div className="text-sm text-muted-foreground mb-1">Preview:</div>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono">{previewUrl}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`https://${previewUrl}`, '_blank')}
                disabled={!hasChanged || isAvailable === false}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <Button
          onClick={handleUpdate}
          disabled={isLoading || !hasChanged || !isValid || isAvailable === false}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Store URL'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default StoreSlugEditor;
