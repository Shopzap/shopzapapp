
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, MessageCircle, Trash2, Edit } from 'lucide-react';

interface KeywordAutomationSectionProps {
  storeData: any;
  igConnection: any;
}

const KeywordAutomationSection: React.FC<KeywordAutomationSectionProps> = ({
  storeData,
  igConnection
}) => {
  const { toast } = useToast();
  const [keywords, setKeywords] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<any>(null);
  const [keywordForm, setKeywordForm] = useState({
    keyword: '',
    language: 'english',
    reply_template: '',
    product_id: ''
  });

  const languageTemplates = {
    english: {
      price: "Hi! The price for this product is ₹{price}. You can order it here: {product_link}",
      available: "Yes, this product is available! ✅ Order now: {product_link}",
      details: "Here are the details about this product: {product_name} - ₹{price}. Order link: {product_link}"
    },
    hindi: {
      price: "नमस्ते! इस प्रोडक्ट की कीमत ₹{price} है। यहाँ ऑर्डर करें: {product_link}",
      available: "हाँ, यह प्रोडक्ट उपलब्ध है! ✅ अभी ऑर्डर करें: {product_link}",
      details: "इस प्रोडक्ट की जानकारी: {product_name} - ₹{price}। ऑर्डर लिंक: {product_link}"
    },
    hinglish: {
      price: "Hi bhai! Iska price ₹{price} hai. Yahan se order karo: {product_link}",
      available: "Haan available hai! ✅ Jaldi order kar lo: {product_link}",
      details: "Yeh product hai: {product_name} - ₹{price}. Order link: {product_link}"
    }
  };

  useEffect(() => {
    fetchKeywords();
    fetchProducts();
  }, []);

  const fetchKeywords = async () => {
    try {
      const { data, error } = await supabase
        .from('ig_keywords')
        .select('*, products(name, price)')
        .eq('store_id', storeData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKeywords(data || []);
    } catch (error) {
      console.error("Error fetching keywords:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price')
        .eq('store_id', storeData.id)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleSubmit = async () => {
    if (!keywordForm.keyword || !keywordForm.reply_template) {
      toast({
        title: "Missing Information",
        description: "Please fill in keyword and reply template",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingKeyword) {
        const { error } = await supabase
          .from('ig_keywords')
          .update({
            keyword: keywordForm.keyword.toLowerCase(),
            language: keywordForm.language,
            reply_template: keywordForm.reply_template,
            product_id: keywordForm.product_id || null
          })
          .eq('id', editingKeyword.id);

        if (error) throw error;
        toast({ title: "Keyword updated successfully!" });
      } else {
        const { error } = await supabase
          .from('ig_keywords')
          .insert({
            store_id: storeData.id,
            keyword: keywordForm.keyword.toLowerCase(),
            language: keywordForm.language,
            reply_template: keywordForm.reply_template,
            product_id: keywordForm.product_id || null
          });

        if (error) throw error;
        toast({ title: "Keyword added successfully!" });
      }

      resetForm();
      fetchKeywords();
    } catch (error) {
      console.error("Error saving keyword:", error);
      toast({
        title: "Error",
        description: "Failed to save keyword. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (keywordId: string) => {
    try {
      const { error } = await supabase
        .from('ig_keywords')
        .update({ is_active: false })
        .eq('id', keywordId);

      if (error) throw error;
      toast({ title: "Keyword deleted successfully!" });
      fetchKeywords();
    } catch (error) {
      console.error("Error deleting keyword:", error);
      toast({
        title: "Error",
        description: "Failed to delete keyword. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setKeywordForm({
      keyword: '',
      language: 'english',
      reply_template: '',
      product_id: ''
    });
    setShowAddForm(false);
    setEditingKeyword(null);
  };

  const startEditing = (keyword: any) => {
    setKeywordForm({
      keyword: keyword.keyword,
      language: keyword.language,
      reply_template: keyword.reply_template,
      product_id: keyword.product_id || ''
    });
    setEditingKeyword(keyword);
    setShowAddForm(true);
  };

  const useTemplate = (templateKey: string) => {
    const template = languageTemplates[keywordForm.language as keyof typeof languageTemplates][templateKey as keyof typeof languageTemplates.english];
    setKeywordForm(prev => ({ ...prev, reply_template: template }));
  };

  if (isLoading) {
    return <div>Loading keywords...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>Keyword Auto-Reply</span>
              </CardTitle>
              <CardDescription>
                Set up automatic DM replies when users comment specific keywords on your posts.
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Keyword
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {keywords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No keywords set up yet. Add your first keyword to get started!</p>
              </div>
            ) : (
              keywords.map((keyword) => (
                <div key={keyword.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">#{keyword.keyword}</span>
                        <span className="text-xs bg-muted px-2 py-1 rounded capitalize">
                          {keyword.language}
                        </span>
                        {keyword.products && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {keyword.products.name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{keyword.reply_template}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(keyword)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(keyword.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingKeyword ? 'Edit Keyword' : 'Add New Keyword'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="keyword">Keyword</Label>
                <Input
                  id="keyword"
                  placeholder="e.g., price, buy, details"
                  value={keywordForm.keyword}
                  onChange={(e) => setKeywordForm(prev => ({
                    ...prev,
                    keyword: e.target.value
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <Select
                  value={keywordForm.language}
                  onValueChange={(value) => setKeywordForm(prev => ({
                    ...prev,
                    language: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="hindi">Hindi</SelectItem>
                    <SelectItem value="hinglish">Hinglish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="product">Link to Product (Optional)</Label>
              <Select
                value={keywordForm.product_id}
                onValueChange={(value) => setKeywordForm(prev => ({
                  ...prev,
                  product_id: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No product link</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - ₹{product.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reply_template">Reply Message</Label>
              <Textarea
                id="reply_template"
                placeholder="Your auto-reply message..."
                value={keywordForm.reply_template}
                onChange={(e) => setKeywordForm(prev => ({
                  ...prev,
                  reply_template: e.target.value
                }))}
                rows={3}
              />
              
              <div className="mt-2">
                <Label className="text-sm">Quick Templates:</Label>
                <div className="flex space-x-2 mt-1">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => useTemplate('price')}
                  >
                    Price Template
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => useTemplate('available')}
                  >
                    Available Template
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => useTemplate('details')}
                  >
                    Details Template
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleSubmit}>
                {editingKeyword ? 'Update Keyword' : 'Add Keyword'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KeywordAutomationSection;
