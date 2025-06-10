
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageCircle, Plus, Trash2, Crown, Lightbulb } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Props {
  storeId: string;
  isPro: boolean;
}

const LANGUAGE_TEMPLATES = {
  english: {
    price: "Hi! The price for this item is ₹{price}. You can order here: {store_link}",
    availability: "Yes, this item is available! Check it out: {store_link}",
    delivery: "We deliver all over India. Free shipping on orders above ₹499! Order now: {store_link}",
  },
  hindi: {
    price: "नमस्ते! इस आइटम की कीमत ₹{price} है। यहाँ ऑर्डर करें: {store_link}",
    availability: "हाँ, यह आइटम उपलब्ध है! देखें: {store_link}",
    delivery: "हम पूरे भारत में डिलीवरी करते हैं। ₹499 से ऊपर फ्री शिपिंग! अभी ऑर्डर करें: {store_link}",
  },
  hinglish: {
    price: "Hey! Iska price ₹{price} hai. Order yahan se karo: {store_link}",
    availability: "Haan bhai, available hai! Check karo: {store_link}",
    delivery: "Poore India mein delivery karte hain. ₹499+ pe free shipping! Order karo: {store_link}",
  },
};

const KeywordManager = ({ storeId, isPro }: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newKeyword, setNewKeyword] = useState({
    keyword: '',
    language: 'hinglish',
    reply_template: '',
    product_id: null,
  });

  const { data: keywords, isLoading } = useQuery({
    queryKey: ['ig-keywords', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ig_keywords')
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

  const addKeywordMutation = useMutation({
    mutationFn: async (keywordData: any) => {
      const { error } = await supabase
        .from('ig_keywords')
        .insert([{ ...keywordData, store_id: storeId }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ig-keywords', storeId] });
      setIsAdding(false);
      setNewKeyword({ keyword: '', language: 'hinglish', reply_template: '', product_id: null });
      toast({
        title: "Keyword Added",
        description: "New keyword trigger has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add keyword trigger.",
        variant: "destructive",
      });
    },
  });

  const deleteKeywordMutation = useMutation({
    mutationFn: async (keywordId: string) => {
      const { error } = await supabase
        .from('ig_keywords')
        .delete()
        .eq('id', keywordId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ig-keywords', storeId] });
      toast({
        title: "Keyword Deleted",
        description: "Keyword trigger has been deleted successfully.",
      });
    },
  });

  const handleTemplateSelect = (keyword: string, language: string) => {
    const template = LANGUAGE_TEMPLATES[language as keyof typeof LANGUAGE_TEMPLATES]?.[keyword as keyof typeof LANGUAGE_TEMPLATES.english];
    if (template) {
      setNewKeyword(prev => ({ ...prev, reply_template: template }));
    }
  };

  const maxKeywords = isPro ? Infinity : 10;
  const canAddMore = (keywords?.length || 0) < maxKeywords;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Keyword Triggers
            <Badge variant="outline">{keywords?.length || 0} / {isPro ? '∞' : '10'}</Badge>
          </CardTitle>
          <CardDescription>
            Set up automatic DM responses for specific keywords mentioned in comments or DMs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isPro && (
            <Alert>
              <Crown className="h-4 w-4" />
              <AlertDescription>
                <strong>Free Plan:</strong> Limited to 10 keyword triggers. Upgrade to Pro for unlimited keywords and product linking.
              </AlertDescription>
            </Alert>
          )}

          {keywords?.map((keyword) => (
            <div key={keyword.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge>{keyword.keyword}</Badge>
                  <Badge variant="outline">{keyword.language}</Badge>
                  {keyword.products && <Badge variant="secondary">{keyword.products.name}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{keyword.reply_template}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => deleteKeywordMutation.mutate(keyword.id)}
                disabled={deleteKeywordMutation.isPending}
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
                  Add New Keyword
                </Button>
              ) : (
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="keyword">Trigger Keyword</Label>
                        <Input
                          id="keyword"
                          placeholder="e.g., price, delivery, available"
                          value={newKeyword.keyword}
                          onChange={(e) => setNewKeyword(prev => ({ ...prev, keyword: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select value={newKeyword.language} onValueChange={(value) => setNewKeyword(prev => ({ ...prev, language: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hinglish">Hinglish</SelectItem>
                            <SelectItem value="hindi">Hindi</SelectItem>
                            <SelectItem value="english">English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {isPro && products && (
                      <div className="space-y-2">
                        <Label htmlFor="product">Link Product (Optional)</Label>
                        <Select value={newKeyword.product_id || ''} onValueChange={(value) => setNewKeyword(prev => ({ ...prev, product_id: value || null }))}>
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
                      <Label htmlFor="template">Auto-Reply Template</Label>
                      <div className="flex gap-2 mb-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTemplateSelect('price', newKeyword.language)}
                        >
                          <Lightbulb className="w-3 h-3 mr-1" />
                          Price Template
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTemplateSelect('availability', newKeyword.language)}
                        >
                          <Lightbulb className="w-3 h-3 mr-1" />
                          Availability Template
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTemplateSelect('delivery', newKeyword.language)}
                        >
                          <Lightbulb className="w-3 h-3 mr-1" />
                          Delivery Template
                        </Button>
                      </div>
                      <Textarea
                        id="template"
                        placeholder="Enter your auto-reply message..."
                        value={newKeyword.reply_template}
                        onChange={(e) => setNewKeyword(prev => ({ ...prev, reply_template: e.target.value }))}
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">
                        Use variables: {'{price}'}, {'{store_link}'}, {'{product_name}'}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => addKeywordMutation.mutate(newKeyword)}
                        disabled={!newKeyword.keyword || !newKeyword.reply_template || addKeywordMutation.isPending}
                      >
                        Add Keyword
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
                You've reached the maximum number of keywords for your plan. Upgrade to Pro for unlimited keywords.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KeywordManager;
