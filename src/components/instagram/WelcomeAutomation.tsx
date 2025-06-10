
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Props {
  storeId: string;
}

const WelcomeAutomation = ({ storeId }: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: welcomeAutomation, isLoading } = useQuery({
    queryKey: ['ig-welcome-automation', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ig_welcome_automation')
        .select('*')
        .eq('store_id', storeId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const updateWelcomeAutomationMutation = useMutation({
    mutationFn: async (automationData: any) => {
      const { error } = await supabase
        .from('ig_welcome_automation')
        .upsert([{ ...automationData, store_id: storeId }], {
          onConflict: 'store_id'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ig-welcome-automation', storeId] });
      toast({
        title: "Welcome Automation Updated",
        description: "Welcome message automation has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update welcome automation.",
        variant: "destructive",
      });
    },
  });

  const handleUpdate = (updates: any) => {
    const updatedData = {
      ...welcomeAutomation,
      ...updates,
      welcome_message: updates.welcome_message || welcomeAutomation?.welcome_message || 'Namaste! Welcome to our store. Thanks for following us! 🙏',
    };
    updateWelcomeAutomationMutation.mutate(updatedData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            New Follower Welcome
            <Badge variant={welcomeAutomation?.is_enabled ? "default" : "secondary"}>
              {welcomeAutomation?.is_enabled ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Automatically welcome new followers with a personalized message.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="welcome-automation">Enable Welcome Messages</Label>
              <p className="text-sm text-muted-foreground">
                Send automatic welcome DMs to new followers
              </p>
            </div>
            <Switch
              id="welcome-automation"
              checked={welcomeAutomation?.is_enabled || false}
              onCheckedChange={(enabled) => handleUpdate({ is_enabled: enabled })}
            />
          </div>

          {welcomeAutomation?.is_enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="welcome_message">Welcome Message</Label>
                <Textarea
                  id="welcome_message"
                  placeholder="Namaste! Welcome to our store. Thanks for following us! 🙏"
                  value={welcomeAutomation?.welcome_message || ''}
                  onChange={(e) => handleUpdate({ welcome_message: e.target.value })}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Use variables: {'{store_link}'}, {'{store_name}'}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Best Practices:</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Keep it warm and personal - use "Namaste" or "Welcome"</li>
                  <li>• Include your store link for easy access</li>
                  <li>• Add emojis to make it friendly and engaging</li>
                  <li>• Mention what they can expect from your content</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Template Examples:</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-white rounded border">
                    <strong>Hindi:</strong> नमस्ते! हमारे स्टोर में आपका स्वागत है। फॉलो करने के लिए धन्यवाद! 🙏 यहाँ शॉप करें: {'{store_link}'}
                  </div>
                  <div className="p-2 bg-white rounded border">
                    <strong>Hinglish:</strong> Hey! Welcome to our store family! Thanks for following us ❤️ Latest products dekho: {'{store_link}'}
                  </div>
                  <div className="p-2 bg-white rounded border">
                    <strong>English:</strong> Welcome to our store! Thanks for following us! Check out our latest products: {'{store_link}'}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeAutomation;
