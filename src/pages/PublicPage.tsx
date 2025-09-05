import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Palette } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { safeOpenUrl, sanitizeText } from '@/lib/security';

interface Item {
  id: string;
  title: string;
  description: string;
  image_url: string;
  target_url: string;
  category_id?: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  position: number;
}

interface Profile {
  username: string;
  page_title: string;
  page_description: string;
  user_id: string;
}

const PublicPage = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (username) {
      fetchProfileAndItems();
    }
  }, [username]);

  const fetchProfileAndItems = async () => {
    try {
      setLoading(true);
      setError(null);

      // First get the profile - only public profiles are accessible
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .eq('public_profile', true)
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (!profileData) {
        setError('This profile is private or not found');
        return;
      }

      setProfile(profileData);

      // Get categories for this user
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', profileData.user_id)
        .eq('is_active', true)
        .order('position');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Then get the recommendations for this user
      const { data: itemsData, error: itemsError } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', profileData.user_id)
        .eq('is_active', true)
        .order('position');

      if (itemsError) throw itemsError;
      setItems(itemsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const getItemsByCategory = (categoryId: string | null) => {
    return items.filter(item => item.category_id === categoryId);
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

  if (!username || error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground">{error || 'The requested user page could not be found.'}</p>
          <p className="text-sm text-muted-foreground mt-2">
            This profile may be set to private or doesn't exist.
          </p>
          <Link to="/" className="text-primary hover:underline mt-4 inline-block">
            ← Back to Curately
          </Link>
        </div>
      </div>
    );
  }

  const uncategorizedItems = getItemsByCategory(null);

  return (
    <div className="min-h-screen bg-muted/60">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/61b68216-f035-4896-8f00-3825ff39d04e.png" 
                alt="Curately Logo" 
                className="w-8 h-8"
              />
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
             {sanitizeText(profile.page_title)}
           </h1>
           <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
             {sanitizeText(profile.page_description)}
           </p>
        </div>

        {/* Categories with Items */}
        {categories.length === 0 && items.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
            <p className="text-muted-foreground">
              {profile.username} hasn't added any recommendations yet.
            </p>
          </div>
        ) : (
          <div className="space-y-16 max-w-6xl mx-auto">
            {/* Categorized Items */}
            {categories.map((category) => {
              const categoryItems = getItemsByCategory(category.id);
              if (categoryItems.length === 0) return null;
              
              return (
                <section key={category.id} className="space-y-8">
                  <div className="text-center">
                     <h2 className="text-3xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
                       {sanitizeText(category.name)}
                     </h2>
                     {category.description && (
                       <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                         {sanitizeText(category.description)}
                       </p>
                     )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categoryItems.map((item) => (
                      <Card 
                        key={item.id} 
                        className="overflow-hidden bg-gradient-card border-border/50 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                        onClick={() => safeOpenUrl(item.target_url)}
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
                              {sanitizeText(item.title)}
                            </h3>
                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                          </div>
                           {item.description && (
                             <p className="text-muted-foreground leading-relaxed">
                               {sanitizeText(item.description)}
                             </p>
                           )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Uncategorized Items */}
            {uncategorizedItems.length > 0 && (
              <section className="space-y-8">
                {categories.length > 0 && (
                  <div className="text-center">
                    <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      More Recommendations
                    </h2>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {uncategorizedItems.map((item) => (
                     <Card 
                       key={item.id} 
                        className="overflow-hidden bg-gradient-card border-border/50 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                       onClick={() => safeOpenUrl(item.target_url)}
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
                             {sanitizeText(item.title)}
                           </h3>
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                        </div>
                         {item.description && (
                           <p className="text-muted-foreground leading-relaxed">
                             {sanitizeText(item.description)}
                           </p>
                         )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
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