import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Palette } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserData {
  username: string;
  page_title: string;
  page_description: string;
  items: {
    id: string;
    title: string;
    description: string;
    image_url: string;
    target_url: string;
  }[];
}

const PublicPage = () => {
  const { username } = useParams<{ username: string }>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (username) {
      fetchUserData();
    }
  }, [username]);

  const fetchUserData = async () => {
    try {
      // First get the user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username, page_title, page_description, user_id')
        .eq('username', username)
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (!profile) {
        setError('User not found');
        setLoading(false);
        return;
      }

      // Then get their recommendations
      const { data: recommendations, error: recsError } = await supabase
        .from('recommendations')
        .select('id, title, description, image_url, target_url')
        .eq('user_id', profile.user_id)
        .eq('is_active', true)
        .order('position');

      if (recsError) throw recsError;

      setUserData({
        username: profile.username,
        page_title: profile.page_title,
        page_description: profile.page_description,
        items: recommendations || []
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading page...</p>
        </div>
      </div>
    );
  }

  if (!username || error || !userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground">{error || 'The requested user page could not be found.'}</p>
          <Link to="/" className="text-primary hover:underline mt-4 inline-block">
            ← Back to Curately
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Curately
              </span>
            </Link>
            <div className="text-sm text-muted-foreground">
              @{username}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            {userData.page_title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {userData.page_description}
          </p>
        </div>

        {/* Items Grid */}
        {userData.items.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
            <p className="text-muted-foreground">
              {userData.username} hasn't added any recommendations yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {userData.items.map((item) => (
              <Card 
                key={item.id} 
                className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                onClick={() => window.open(item.target_url, '_blank')}
              >
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={item.image_url} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                  </div>
                  {item.description && (
                    <p className="text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-16 pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Powered by{' '}
            <Link 
              to="/" 
              className="text-primary hover:underline font-medium"
            >
              Curately
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default PublicPage;