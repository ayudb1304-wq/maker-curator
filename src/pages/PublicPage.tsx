import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Palette } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { safeOpenUrl, sanitizeText } from '@/lib/security';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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
  display_name: string;
  page_title: string;
  page_description: string;
  avatar_url: string;
  user_id: string;
}

const PublicPage = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [visibleItems, setVisibleItems] = useState<Record<string, number>>({});
  const [showMoreClicked, setShowMoreClicked] = useState<Record<string, boolean>>({});
  
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (username) {
      fetchProfileAndItems();
    }
  }, [username]);

  useEffect(() => {
    // Initialize visible items count for each category
    const initialVisibleItems: Record<string, number> = {};
    const initialShowMore: Record<string, boolean> = {};
    
    categories.forEach(category => {
      const categoryItems = getItemsByCategory(category.id);
      initialVisibleItems[category.id] = Math.min(12, categoryItems.length);
      initialShowMore[category.id] = false;
    });
    
    // Handle uncategorized items
    const uncategorizedItems = getItemsByCategory(null);
    if (uncategorizedItems.length > 0) {
      initialVisibleItems['uncategorized'] = Math.min(12, uncategorizedItems.length);
      initialShowMore['uncategorized'] = false;
    }
    
    setVisibleItems(initialVisibleItems);
    setShowMoreClicked(initialShowMore);
  }, [categories, items]);

  useEffect(() => {
    const handleScroll = () => {
      if (!navRef.current) return;
      
      const navRect = navRef.current.getBoundingClientRect();
      const isSticky = navRect.top <= 0;
      
      if (isSticky) {
        navRef.current.classList.add('sticky-nav');
      } else {
        navRef.current.classList.remove('sticky-nav');
      }
      
      // Determine active category based on scroll position
      let currentActive: string | null = null;
      const scrollPosition = window.scrollY + 200; // Increased offset for better detection
      
      Object.entries(categoryRefs.current).forEach(([categoryId, element]) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = window.scrollY + rect.top;
          const elementBottom = elementTop + element.offsetHeight;
          
          if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
            currentActive = categoryId;
          }
        }
      });
      
      if (currentActive) {
        setActiveCategory(currentActive);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories]);

  const fetchProfileAndItems = async () => {
    try {
      setLoading(true);
      setError(null);

      // First get the profile - only public profiles are accessible
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, display_name, page_title, page_description, avatar_url, user_id')
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
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const scrollToCategory = (categoryId: string) => {
    const element = categoryRefs.current[categoryId];
    if (element) {
      setActiveCategory(categoryId); // Set active immediately when clicked
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleShowMore = (categoryId: string) => {
    const categoryItems = categoryId === 'uncategorized' 
      ? getItemsByCategory(null) 
      : getItemsByCategory(categoryId);
    
    setVisibleItems(prev => ({
      ...prev,
      [categoryId]: categoryItems.length
    }));
    
    setShowMoreClicked(prev => ({
      ...prev,
      [categoryId]: true
    }));
  };

  const shouldShowMoreButton = (categoryId: string) => {
    const categoryItems = categoryId === 'uncategorized' 
      ? getItemsByCategory(null) 
      : getItemsByCategory(categoryId);
    
    return categoryItems.length > 10 && !showMoreClicked[categoryId];
  };

  const getVisibleItems = (categoryId: string) => {
    const categoryItems = categoryId === 'uncategorized' 
      ? getItemsByCategory(null) 
      : getItemsByCategory(categoryId);
    
    const visibleCount = visibleItems[categoryId] || 12;
    return categoryItems.slice(0, visibleCount);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
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
        {/* Profile Header */}
        <div className="relative mb-16 rounded-2xl border border-border/50 overflow-hidden shadow-card animate-fade-in">
          <div className="relative px-6 py-10 text-center">
            <div className="flex justify-center mb-6">
              <Avatar className="w-32 h-32 border-4 border-background shadow-elegant">
                <AvatarImage src={profile.avatar_url} alt={profile.display_name || profile.username} />
                <AvatarFallback className="text-3xl font-bold bg-gradient-primary text-primary-foreground">
                  {getInitials(profile.display_name || profile.username)}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="space-y-4">
              <div>
                <h1 className="text-5xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                  {sanitizeText(profile.display_name || profile.username)}
                </h1>
                <p className="text-lg text-muted-foreground font-mono">@{username}</p>
              </div>
              
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-semibold mb-3">
                  {sanitizeText(profile.page_title)}
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {sanitizeText(profile.page_description)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Category Navigation */}
        {categories.length > 0 && (
          <nav 
            ref={navRef}
            className="bg-background/80 backdrop-blur-md border border-border/50 rounded-xl p-4 mb-8 transition-all duration-300 z-50"
            style={{ position: 'sticky', top: '1rem' }}
          >
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => scrollToCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeCategory === category.id
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {sanitizeText(category.name)}
                </button>
              ))}
              {getItemsByCategory(null).length > 0 && (
                <button
                  onClick={() => scrollToCategory('uncategorized')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeCategory === 'uncategorized'
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  More Recommendations
                </button>
              )}
            </div>
          </nav>
        )}

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
            {categories.map((category, index) => {
              const categoryItems = getItemsByCategory(category.id);
              if (categoryItems.length === 0) return null;
              
              const visibleCategoryItems = getVisibleItems(category.id);
              
              // Alternate gradient backgrounds for each category
              const gradientClasses = [
                'bg-gradient-section-1',
                'bg-gradient-section-2', 
                'bg-gradient-section-3',
                'bg-gradient-section-4'
              ];
              const gradientClass = gradientClasses[index % gradientClasses.length];
              
              return (
                <section 
                  key={category.id} 
                  ref={el => categoryRefs.current[category.id] = el}
                  className="relative rounded-3xl overflow-hidden shadow-card"
                >
                  <div className={`absolute inset-0 ${gradientClass} opacity-10`}></div>
                  <div className="relative px-6 py-12 space-y-8">
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
                    
                     <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                       {visibleCategoryItems.map((item) => (
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
                     
                     {/* Show More Button */}
                     {shouldShowMoreButton(category.id) && (
                       <div className="text-center pt-6">
                         <Button
                           variant="outline"
                           onClick={() => handleShowMore(category.id)}
                           className="px-8 py-2"
                         >
                           Show More ({categoryItems.length - (visibleItems[category.id] || 12)} more items)
                         </Button>
                       </div>
                     )}
                   </div>
                 </section>
               );
             })}

             {/* Uncategorized Items */}
             {uncategorizedItems.length > 0 && (
               <section 
                 ref={el => categoryRefs.current['uncategorized'] = el}
                 className="space-y-8"
               >
                 {categories.length > 0 && (
                   <div className="text-center">
                     <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                       More Recommendations
                     </h2>
                   </div>
                 )}
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                   {getVisibleItems('uncategorized').map((item) => (
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
                 
                 {/* Show More Button for Uncategorized */}
                 {shouldShowMoreButton('uncategorized') && (
                   <div className="text-center pt-6">
                     <Button
                       variant="outline"
                       onClick={() => handleShowMore('uncategorized')}
                       className="px-8 py-2"
                     >
                       Show More ({uncategorizedItems.length - (visibleItems['uncategorized'] || 12)} more items)
                     </Button>
                   </div>
                 )}
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