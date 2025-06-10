
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Instagram, Plus, Trash2, Crown, ExternalLink } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Props {
  storeId: string;
  isPro: boolean;
}

const ReelsAutomation = ({ storeId, isPro }: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newReel, setNewReel] = useState({
    post_url: '',
    trigger_word: 'link please',
    reply_message: '',
    product_id: null,
  });

  const { data: reels, isLoading } = useQuery({
    queryKey: ['ig-reels', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ig_reels_automation')
        .select('*, products(name)')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
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

  const addReelMutation = useMutation({
    mutationFn: async (reelData: any) => {
      const { error } = await supabase
        .from('ig_reels_automation')
        .insert([{ ...reelData, store_id: storeId }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ig-reels', storeId] });
      setIsAdding(false);
      setNewReel({ post_url: '', trigger_word: 'link please', reply_message: '', product_id: null });
      toast({
        title: "Reel Automation Added",
        description: "New reel automation has been set up successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add reel automation.",
        variant: "destructive",
      });
    },
  });

  const deleteReelMutation = useMutation({
    mutationFn: async (reelId: string) => {
      const { error } = await supabase
        .from('ig_reels_automation')
        .delete()
        .eq('id', reelId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ig-reels', storeId] });
      toast({
        title: "Reel Automation Deleted",
        description: "Reel automation has been deleted successfully.",
      });
    },
  });

  // Calculate weekly limit based on plan
  const currentWeek = new Date().toISOString().slice(0, 10);
  const weeklyReels = reels?.filter(reel => 
    new Date(reel.created_at).toISOString().slice(0, 10) >= currentWeek
  ).length || 0;
  
  const maxReelsPerWeek = isPro ? Infinity : 1;
  const canAddMore = weeklyReels < maxReelsPerWeek;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="w-5 h-5" />
            Reels Comment Automation
            <Badge variant="outline">{reels?.length || 0} Active</Badge>
          </CardTitle>
          <CardDescription>
            Automatically send DMs when users comment specific trigger words on your reels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isPro && (
            <Alert>
              <Crown className="h-4 w-4" />
              <AlertDescription>
                <strong>Free Plan:</strong> Limited to 1 reel automation per week. Upgrade to Pro for unlimited reels automation.
              </AlertDescription>
            </Alert>
          )}

          {reels?.map((reel) => (
            <div key={reel.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge>{reel.trigger_word}</Badge>
                  {reel.products && <Badge variant="secondary">{reel.products.name}</Badge>}
                  <a href={reel.post_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    <ExternalLink className="w-3 h-3 inline mr-1" />
                    View Post
                  </a>
                </div>
                <p className="text-sm text-muted-foreground">{reel.reply_message}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => deleteReelMutation.mutate(reel.id)}
                disabled={deleteReelMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {canAddMore && (
            <>
              {!isAdding ? (
                <Button onClick={() => setIsAdding(true)} className="w-full" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Reel Automation
                </Button>
              ) : (
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="post_url">Reel/Post URL</Label>
                      <Input
                        id="post_url"
                        placeholder="https://www.instagram.com/reel/..."
                        value={newReel.post_url}
                        onChange={(e) => setNewReel(prev => ({ ...prev, post_url: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="trigger_word">Trigger Word</Label>
                      <Input
                        id="trigger_word"
                        placeholder="e.g., link please, dm me, price"
                        value={newReel.trigger_word}
                        onChange={(e) => setNewReel(prev => ({ ...prev, trigger_word: e.target.value }))}
                      />
                    </div>

                    {isPro && products && (
                      <div className="space-y-2">
                        <Label htmlFor="product">Link Product (Optional)</Label>
                        <Select value={newReel.product_id || ''} onValueChange={(value) => setNewReel(prev => ({ ...prev, product_id: value || null }))}>
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
                        placeholder="Hey! Thanks for your interest. Here's the link: {store_link}"
                        value={newReel.reply_message}
                        onChange={(e) => setNewReel(prev => ({ ...prev, reply_message: e.target.value }))}
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">
                        Use variables: {'{store_link}'}, {'{product_name}'}, {'{price}'}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => addReelMutation.mutate(newReel)}
                        disabled={!newReel.post_url || !newReel.trigger_word || !newReel.reply_message || addReelMutation.isPending}
                      >
                        Add Automation
                      </Button>
                      <Button variant="outline" onClick={() => setIsAdding(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {!canAddMore && (
            <Alert>
              <Crown className="h-4 w-4" />
              <AlertDescription>
                You've reached your weekly limit for reel automation. Upgrade to Pro for unlimited automations.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReelsAutomation;
