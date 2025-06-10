
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Crown } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Props {
  storeId: string;
  isPro: boolean;
}

const StoryAutomation = ({ storeId, isPro }: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: storyAutomation, isLoading } = useQuery({
    queryKey: ['ig-story-automation', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ig_story_automation')
        .select('*, products(name)')
        .eq('store_id', storeId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ['store-products', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .eq('store_id', storeId)
        .eq('status', 'active')
        .limit(isPro ? 1000 : 5);
      
      if (error) throw error;
      return data;
    },
  });

  const updateStoryAutomationMutation = useMutation({
    mutationFn: async (automationData: any) => {
      const { error } = await supabase
        .from('ig_story_automation')
        .upsert([{ ...automationData, store_id: storeId }], {
          onConflict: 'store_id'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ig-story-automation', storeId] });
      toast({
        title: "Story Automation Updated",
        description: "Story reply automation has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update story automation.",
        variant: "destructive",
      });
    },
  });

  const handleUpdate = (updates: any) => {
    const updatedData = {
      ...storyAutomation,
      ...updates,
      reply_message: updates.reply_message || storyAutomation?.reply_message || 'Thanks for replying to our story! Check out our store: {store_link}',
    };
    updateStoryAutomationMutation.mutate(updatedData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Story Reply Automation
            <Badge variant={storyAutomation?.is_enabled ? "default" : "secondary"}>
              {storyAutomation?.is_enabled ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Automatically send DMs when users reply to your Instagram stories.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="story-automation">Enable Story Reply Automation</Label>
              <p className="text-sm text-muted-foreground">
                Send automatic DMs when someone replies to your stories
              </p>
            </div>
            <Switch
              id="story-automation"
              checked={storyAutomation?.is_enabled || false}
              onCheckedChange={(enabled) => handleUpdate({ is_enabled: enabled })}
            />
          </div>

          {storyAutomation?.is_enabled && (
            <>
              {isPro && products && (
                <div className="space-y-2">
                  <Label htmlFor="product">Link Product (Optional)</Label>
                  <Select 
                    value={storyAutomation.product_id || ''} 
                    onValueChange={(value) => handleUpdate({ product_id: value || null })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product to link" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No product</SelectItem>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reply_message">Auto-DM Message</Label>
                <Textarea
                  id="reply_message"
                  placeholder="Thanks for replying to our story! Check out our store: {store_link}"
                  value={storyAutomation?.reply_message || ''}
                  onChange={(e) => handleUpdate({ reply_message: e.target.value })}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Use variables: {'{store_link}'}, {'{product_name}'}, {'{price}'}
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• When someone replies to your story, they automatically get this DM</li>
                  <li>• Great for product launches and promotional stories</li>
                  <li>• Helps convert story engagement into sales</li>
                </ul>
              </div>

              {!isPro && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-4 h-4 text-orange-600" />
                    <h4 className="font-semibold text-orange-900">Upgrade to Pro</h4>
                  </div>
                  <p className="text-sm text-orange-800">
                    Unlock product linking in story replies with Pro plan.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StoryAutomation;
