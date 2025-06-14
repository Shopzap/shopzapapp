
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram, ExternalLink } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface InstaFeedProps {
  storeId: string;
}

interface InstagramPost {
  id: string;
  image_url: string;
  caption: string;
  permalink: string;
  timestamp?: string;
}

export const InstaFeed: React.FC<InstaFeedProps> = ({ storeId }) => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [instagramHandle, setInstagramHandle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInstagramData();
  }, [storeId]);

  const fetchInstagramData = async () => {
    try {
      // Get Instagram connection info
      const { data: connection } = await supabase
        .from('instagram_connections')
        .select('ig_username, is_active')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .maybeSingle();

      if (connection?.ig_username) {
        setInstagramHandle(connection.ig_username);
      }

      // Fetch posts from ig_feed table
      const { data: feedPosts, error } = await supabase
        .from('ig_feed')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching Instagram feed:', error);
        loadDummyPosts();
        return;
      }

      if (feedPosts && feedPosts.length > 0) {
        setPosts(feedPosts.map(post => ({
          id: post.id,
          image_url: post.image_url,
          caption: post.caption || '',
          permalink: post.permalink || '#',
          timestamp: post.timestamp || post.created_at
        })));
      } else {
        loadDummyPosts();
      }
    } catch (error) {
      console.error('Error fetching Instagram data:', error);
      loadDummyPosts();
    } finally {
      setIsLoading(false);
    }
  };

  const loadDummyPosts = () => {
    const dummyPosts: InstagramPost[] = [
      {
        id: '1',
        image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
        caption: 'Check out our latest collection! 🛍️ #fashion #style',
        permalink: '#'
      },
      {
        id: '2',
        image_url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=400&fit=crop',
        caption: 'Behind the scenes at our store 📸 #behindthescenes',
        permalink: '#'
      },
      {
        id: '3',
        image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop',
        caption: 'Customer favorites this week! ⭐ #bestsellers',
        permalink: '#'
      },
      {
        id: '4',
        image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop',
        caption: 'New arrivals just dropped! 🔥 #newin',
        permalink: '#'
      }
    ];
    setPosts(dummyPosts);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Instagram Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Instagram className="h-5 w-5" />
          {instagramHandle ? `@${instagramHandle}` : 'Instagram Feed'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {posts.slice(0, 6).map((post) => (
            <div key={post.id} className="group relative aspect-square overflow-hidden rounded-lg">
              <img
                src={post.image_url}
                alt={post.caption}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <ExternalLink className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {post.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs truncate">
                    {post.caption}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {instagramHandle && (
          <div className="mt-4 text-center">
            <a
              href={`https://instagram.com/${instagramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              View more on Instagram →
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
