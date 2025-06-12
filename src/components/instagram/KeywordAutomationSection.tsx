
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
  const [automations, setAutomations] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<any>(null);
  const [automationForm, setAutomationForm] = useState({
    keywords: '',
    language: 'english',
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
      details: "Yeh product hai: {product_name} - ₹{price}। Order link: {product_link}"
    }
  };

  useEffect(() => {
    fetchAutomations();
    fetchProducts();
  }, []);

  const fetchAutomations = async () => {
    try {
      const { data, error } = await supabase
        .from('ig_automations')
        .select('*, products(name, price)')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAutomations(data || []);
    } catch (error) {
      console.error("Error fetching automations:", error);
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
    if (!automationForm.keywords) {
      toast({
        title: "Missing Information",
        description: "Please fill in keywords",
        variant: "destructive"
      });
      return;
    }

    try {
      const keywordsArray = automationForm.keywords.split(',').map(k => k.trim()).filter(k => k);
      
      if (editingAutomation) {
        const { error } = await supabase
          .from('ig_automations')
          .update({
            trigger_keywords: keywordsArray,
            product_id: automationForm.product_id || null
          })
          .eq('id', editingAutomation.id);

        if (error) throw error;
        toast({ title: "Automation updated successfully!" });
      } else {
        const { error } = await supabase
          .from('ig_automations')
          .insert({
            store_id: storeData.id,
            trigger_keywords: keywordsArray,
            product_id: automationForm.product_id || null
          });

        if (error) throw error;
        toast({ title: "Automation added successfully!" });
      }

      resetForm();
      fetchAutomations();
    } catch (error) {
      console.error("Error saving automation:", error);
      toast({
        title: "Error",
        description: "Failed to save automation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (automationId: string) => {
    try {
      const { error } = await supabase
        .from('ig_automations')
        .delete()
        .eq('id', automationId);

      if (error) throw error;
      toast({ title: "Automation deleted successfully!" });
      fetchAutomations();
    } catch (error) {
      console.error("Error deleting automation:", error);
      toast({
        title: "Error",
        description: "Failed to delete automation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setAutomationForm({
      keywords: '',
      language: 'english',
      product_id: ''
    });
    setShowAddForm(false);
    setEditingAutomation(null);
  };

  const startEditing = (automation: any) => {
    setAutomationForm({
      keywords: automation.trigger_keywords.join(', '),
      language: 'english',
      product_id: automation.product_id || ''
    });
    setEditingAutomation(automation);
    setShowAddForm(true);
  };

  if (isLoading) {
    return <div>Loading automations...</div>;
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
              Add Keywords
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No keyword automations set up yet. Add your first automation to get started!</p>
              </div>
            ) : (
              automations.map((automation) => (
                <div key={automation.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Keywords: {automation.trigger_keywords.join(', ')}</span>
                        {automation.products && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {automation.products.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(automation)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(automation.id)}
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
              {editingAutomation ? 'Edit Automation' : 'Add New Automation'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="keywords">Keywords (comma-separated)</Label>
              <Input
                id="keywords"
                placeholder="e.g., price, buy, details"
                value={automationForm.keywords}
                onChange={(e) => setAutomationForm(prev => ({
                  ...prev,
                  keywords: e.target.value
                }))}
              />
            </div>

            <div>
              <Label htmlFor="product">Link to Product (Optional)</Label>
              <Select
                value={automationForm.product_id}
                onValueChange={(value) => setAutomationForm(prev => ({
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

            <div className="flex space-x-2">
              <Button onClick={handleSubmit}>
                {editingAutomation ? 'Update Automation' : 'Add Automation'}
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
