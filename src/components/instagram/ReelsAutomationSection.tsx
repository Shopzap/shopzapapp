
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Play, Plus, Users, Edit, Trash2 } from 'lucide-react';

interface ReelsAutomationSectionProps {
  storeData: any;
  igConnection: any;
}

const ReelsAutomationSection: React.FC<ReelsAutomationSectionProps> = ({
  storeData,
  igConnection
}) => {
  const { toast } = useToast();
  const [reelsAutomation, setReelsAutomation] = useState<any[]>([]);
  const [storyAutomation, setStoryAutomation] = useState<any>(null);
  const [welcomeAutomation, setWelcomeAutomation] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddReelForm, setShowAddReelForm] = useState(false);
  const [editingReel, setEditingReel] = useState<any>(null);
  
  const [reelForm, setReelForm] = useState({
    post_url: '',
    trigger_word: 'link please',
    reply_message: '',
    product_id: ''
  });

  const [storyForm, setStoryForm] = useState({
    reply_message: 'Thank you for replying to my story! Here\'s what you\'re looking for: {product_link}',
    is_enabled: false,
    product_id: ''
  });

  const [welcomeForm, setWelcomeForm] = useState({
    welcome_message: 'Namaste! Welcome to our store. Thanks for following us! 🙏',
    is_enabled: false
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchReelsAutomation(),
        fetchStoryAutomation(),
        fetchWelcomeAutomation(),
        fetchProducts()
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReelsAutomation = async () => {
    try {
      const { data, error } = await supabase
        .from('ig_reels_automation')
        .select('*, products(name, price)')
        .eq('store_id', storeData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReelsAutomation(data || []);
    } catch (error) {
      console.error("Error fetching reels automation:", error);
    }
  };

  const fetchStoryAutomation = async () => {
    try {
      const { data, error } = await supabase
        .from('ig_story_automation')
        .select('*, products(name, price)')
        .eq('store_id', storeData.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setStoryAutomation(data);
        setStoryForm({
          reply_message: data.reply_message,
          is_enabled: data.is_enabled,
          product_id: data.product_id || ''
        });
      }
    } catch (error) {
      console.error("Error fetching story automation:", error);
    }
  };

  const fetchWelcomeAutomation = async () => {
    try {
      const { data, error } = await supabase
        .from('ig_welcome_automation')
        .select('*')
        .eq('store_id', storeData.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setWelcomeAutomation(data);
        setWelcomeForm({
          welcome_message: data.welcome_message,
          is_enabled: data.is_enabled
        });
      }
    } catch (error) {
      console.error("Error fetching welcome automation:", error);
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

  const handleReelSubmit = async () => {
    if (!reelForm.post_url || !reelForm.reply_message) {
      toast({
        title: "Missing Information",
        description: "Please fill in post URL and reply message",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingReel) {
        const { error } = await supabase
          .from('ig_reels_automation')
          .update({
            post_url: reelForm.post_url,
            trigger_word: reelForm.trigger_word,
            reply_message: reelForm.reply_message,
            product_id: reelForm.product_id || null
          })
          .eq('id', editingReel.id);

        if (error) throw error;
        toast({ title: "Reel automation updated successfully!" });
      } else {
        const { error } = await supabase
          .from('ig_reels_automation')
          .insert({
            store_id: storeData.id,
            post_url: reelForm.post_url,
            trigger_word: reelForm.trigger_word,
            reply_message: reelForm.reply_message,
            product_id: reelForm.product_id || null
          });

        if (error) throw error;
        toast({ title: "Reel automation added successfully!" });
      }

      resetReelForm();
      fetchReelsAutomation();
    } catch (error) {
      console.error("Error saving reel automation:", error);
      toast({
        title: "Error",
        description: "Failed to save reel automation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleStorySubmit = async () => {
    try {
      if (storyAutomation) {
        const { error } = await supabase
          .from('ig_story_automation')
          .update({
            reply_message: storyForm.reply_message,
            is_enabled: storyForm.is_enabled,
            product_id: storyForm.product_id || null
          })
          .eq('id', storyAutomation.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ig_story_automation')
          .insert({
            store_id: storeData.id,
            reply_message: storyForm.reply_message,
            is_enabled: storyForm.is_enabled,
            product_id: storyForm.product_id || null
          });

        if (error) throw error;
      }

      toast({ title: "Story automation updated successfully!" });
      fetchStoryAutomation();
    } catch (error) {
      console.error("Error saving story automation:", error);
      toast({
        title: "Error",
        description: "Failed to save story automation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleWelcomeSubmit = async () => {
    try {
      if (welcomeAutomation) {
        const { error } = await supabase
          .from('ig_welcome_automation')
          .update({
            welcome_message: welcomeForm.welcome_message,
            is_enabled: welcomeForm.is_enabled
          })
          .eq('id', welcomeAutomation.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ig_welcome_automation')
          .insert({
            store_id: storeData.id,
            welcome_message: welcomeForm.welcome_message,
            is_enabled: welcomeForm.is_enabled
          });

        if (error) throw error;
      }

      toast({ title: "Welcome automation updated successfully!" });
      fetchWelcomeAutomation();
    } catch (error) {
      console.error("Error saving welcome automation:", error);
      toast({
        title: "Error",
        description: "Failed to save welcome automation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetReelForm = () => {
    setReelForm({
      post_url: '',
      trigger_word: 'link please',
      reply_message: '',
      product_id: ''
    });
    setShowAddReelForm(false);
    setEditingReel(null);
  };

  const startEditingReel = (reel: any) => {
    setReelForm({
      post_url: reel.post_url,
      trigger_word: reel.trigger_word,
      reply_message: reel.reply_message,
      product_id: reel.product_id || ''
    });
    setEditingReel(reel);
    setShowAddReelForm(true);
  };

  const handleDeleteReel = async (reelId: string) => {
    try {
      const { error } = await supabase
        .from('ig_reels_automation')
        .update({ is_active: false })
        .eq('id', reelId);

      if (error) throw error;
      toast({ title: "Reel automation deleted successfully!" });
      fetchReelsAutomation();
    } catch (error) {
      console.error("Error deleting reel automation:", error);
      toast({
        title: "Error",
        description: "Failed to delete reel automation. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div>Loading automation settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Reels/Posts Comment Automation */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Play className="h-5 w-5" />
                <span>Reels & Posts Automation</span>
              </CardTitle>
              <CardDescription>
                Automatically reply to specific comments on your posts and reels with DMs.
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddReelForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Post/Reel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reelsAutomation.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No reel automations set up yet. Add your first post/reel to get started!</p>
              </div>
            ) : (
              reelsAutomation.map((reel) => (
                <div key={reel.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">Post URL:</span>
                        <a 
                          href={reel.post_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {reel.post_url.length > 50 ? `${reel.post_url.substring(0, 50)}...` : reel.post_url}
                        </a>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          Trigger: "{reel.trigger_word}"
                        </span>
                        {reel.products && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {reel.products.name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{reel.reply_message}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditingReel(reel)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteReel(reel.id)}
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

      {/* Add/Edit Reel Form */}
      {showAddReelForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingReel ? 'Edit Post/Reel Automation' : 'Add Post/Reel Automation'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="post_url">Post/Reel URL</Label>
              <Input
                id="post_url"
                placeholder="https://instagram.com/p/your-post-id"
                value={reelForm.post_url}
                onChange={(e) => setReelForm(prev => ({
                  ...prev,
                  post_url: e.target.value
                }))}
              />
            </div>

            <div>
              <Label htmlFor="trigger_word">Trigger Word/Phrase</Label>
              <Input
                id="trigger_word"
                placeholder="e.g., link please, price, buy"
                value={reelForm.trigger_word}
                onChange={(e) => setReelForm(prev => ({
                  ...prev,
                  trigger_word: e.target.value
                }))}
              />
            </div>

            <div>
              <Label htmlFor="product">Link to Product (Optional)</Label>
              <Select
                value={reelForm.product_id}
                onValueChange={(value) => setReelForm(prev => ({
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
              <Label htmlFor="reply_message">Auto-Reply Message</Label>
              <Textarea
                id="reply_message"
                placeholder="Your automatic DM response..."
                value={reelForm.reply_message}
                onChange={(e) => setReelForm(prev => ({
                  ...prev,
                  reply_message: e.target.value
                }))}
                rows={3}
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleReelSubmit}>
                {editingReel ? 'Update Automation' : 'Add Automation'}
              </Button>
              <Button variant="outline" onClick={resetReelForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Story Reply Automation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Story Reply Automation</span>
          </CardTitle>
          <CardDescription>
            Automatically send a DM when someone replies to your Instagram stories.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="story-enabled"
              checked={storyForm.is_enabled}
              onCheckedChange={(checked) => setStoryForm(prev => ({
                ...prev,
                is_enabled: checked
              }))}
            />
            <Label htmlFor="story-enabled">Enable Story Reply Automation</Label>
          </div>

          <div>
            <Label htmlFor="story-product">Link to Product (Optional)</Label>
            <Select
              value={storyForm.product_id}
              onValueChange={(value) => setStoryForm(prev => ({
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
            <Label htmlFor="story-reply">Auto-Reply Message</Label>
            <Textarea
              id="story-reply"
              placeholder="Thank you for replying to my story!"
              value={storyForm.reply_message}
              onChange={(e) => setStoryForm(prev => ({
                ...prev,
                reply_message: e.target.value
              }))}
              rows={3}
            />
          </div>

          <Button onClick={handleStorySubmit}>
            Update Story Automation
          </Button>
        </CardContent>
      </Card>

      {/* Welcome Message Automation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>New Follower Welcome</span>
          </CardTitle>
          <CardDescription>
            Automatically send a welcome DM to new followers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="welcome-enabled"
              checked={welcomeForm.is_enabled}
              onCheckedChange={(checked) => setWelcomeForm(prev => ({
                ...prev,
                is_enabled: checked
              }))}
            />
            <Label htmlFor="welcome-enabled">Enable Welcome Message</Label>
          </div>

          <div>
            <Label htmlFor="welcome-message">Welcome Message</Label>
            <Textarea
              id="welcome-message"
              placeholder="Welcome to our store! Thanks for following us!"
              value={welcomeForm.welcome_message}
              onChange={(e) => setWelcomeForm(prev => ({
                ...prev,
                welcome_message: e.target.value
              }))}
              rows={3}
            />
          </div>

          <Button onClick={handleWelcomeSubmit}>
            Update Welcome Message
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReelsAutomationSection;
