import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Youtube, Twitter, Linkedin, Instagram, Camera } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { sanitizeText } from '@/lib/security';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';

interface DemoItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  target_url: string;
  category_id?: string;
}

interface DemoCategory {
  id: string;
  name: string;
  description: string;
  position: number;
}

interface DemoProfile {
  username: string;
  display_name: string;
  page_title: string;
  page_description: string;
  avatar_url: string;
  use_avatar_background: boolean;
  user_id: string;
  youtube_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  tiktok_url?: string;
  instagram_url?: string;
  threads_url?: string;
  snapchat_url?: string;
}

const demoProfile: DemoProfile = {
  username: "sushmitha",
  display_name: "Sushmitha",
  page_title: "Sushmitha's Curated Recommendations",
  page_description: "A carefully curated collection of my favorite tools, products, and resources that make life better.",
  avatar_url: "/lovable-uploads/262910fa-1906-4d6c-a25c-5ab0cbfe4267.png",
  use_avatar_background: true,
  user_id: "demo-user",
  youtube_url: "https://youtube.com/@sushmitha",
  twitter_url: "https://twitter.com/sushmitha",
  linkedin_url: "https://linkedin.com/in/sushmitha",
  instagram_url: "https://instagram.com/sushmitha",
  tiktok_url: "https://tiktok.com/@sushmitha",
  threads_url: "https://www.threads.net/@sushmitha",
  snapchat_url: "https://snapchat.com/add/sushmitha"
};

const demoCategories: DemoCategory[] = [
  {
    id: "tech",
    name: "Tech & Productivity",
    description: "Tools and apps that boost productivity and make work more enjoyable",
    position: 1
  },
  {
    id: "lifestyle",
    name: "Lifestyle & Wellness", 
    description: "Products and services for a healthier, more balanced life",
    position: 2
  },
  {
    id: "learning",
    name: "Learning & Growth",
    description: "Resources for continuous learning and personal development",
    position: 3
  },
  {
    id: "design",
    name: "Design & Creativity",
    description: "Beautiful tools and inspiration for creative work",
    position: 4
  }
];

const demoItems: DemoItem[] = [
  {
    id: "1",
    title: "Notion",
    description: "The all-in-one workspace for notes, tasks, wikis, and databases. Perfect for organizing everything in one place.",
    image_url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop",
    target_url: "https://notion.so",
    category_id: "tech"
  },
  {
    id: "2", 
    title: "Raycast",
    description: "A blazingly fast, totally extendable launcher for Mac. It lets you complete tasks, calculate, share common links, and much more.",
    image_url: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=600&fit=crop",
    target_url: "https://raycast.com",
    category_id: "tech"
  },
  {
    id: "3",
    title: "Linear",
    description: "The issue tracking tool you'll enjoy using. Beautiful, fast, and purpose-built for modern software teams.",
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    target_url: "https://linear.app",
    category_id: "tech"
  },
  {
    id: "4",
    title: "Arc Browser",
    description: "A modern web browser designed for efficiency and organization. Features vertical tabs and powerful workspaces.",
    image_url: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=800&h=600&fit=crop",
    target_url: "https://arc.net",
    category_id: "tech"
  },
  {
    id: "5",
    title: "Headspace",
    description: "Meditation and mindfulness made simple. Guided meditations, sleep stories, and breathing exercises.",
    image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    target_url: "https://headspace.com",
    category_id: "lifestyle"
  },
  {
    id: "6",
    title: "Theragun",
    description: "Percussive therapy device that helps you recover faster, train harder, and sleep better.",
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
    target_url: "https://theragun.com",
    category_id: "lifestyle"
  },
  {
    id: "7",
    title: "Oura Ring",
    description: "Track your sleep, recovery, and readiness with this stylish smart ring that provides personalized insights.",
    image_url: "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800&h=600&fit=crop",
    target_url: "https://ouraring.com",
    category_id: "lifestyle"
  },
  {
    id: "8",
    title: "Calm",
    description: "Meditation, sleep stories, and relaxation techniques to help you live mindfully and sleep better.",
    image_url: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=800&h=600&fit=crop",
    target_url: "https://calm.com",
    category_id: "lifestyle"
  },
  {
    id: "9",
    title: "MasterClass",
    description: "Learn from the world's best instructors. 180+ classes from Gordon Ramsay, Neil Gaiman, and more.",
    image_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop",
    target_url: "https://masterclass.com",
    category_id: "learning"
  },
  {
    id: "10",
    title: "Blinkist",
    description: "Get the key insights from top nonfiction books in text or audio — in just 15 minutes.",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
    target_url: "https://blinkist.com",
    category_id: "learning"
  },
  {
    id: "11",
    title: "Duolingo",
    description: "Learn a language for free. Fun, effective, and 100% free language learning platform.",
    image_url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop",
    target_url: "https://duolingo.com",
    category_id: "learning"
  },
  {
    id: "12",
    title: "Coursera",
    description: "Online courses from top universities and companies. Earn certificates and degrees from world-class institutions.",
    image_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
    target_url: "https://coursera.org",
    category_id: "learning"
  },
  {
    id: "13",
    title: "Figma",
    description: "The collaborative interface design tool. Design, prototype, and gather feedback all in one place.",
    image_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
    target_url: "https://figma.com",
    category_id: "design"
  },
  {
    id: "14",
    title: "Unsplash",
    description: "Beautiful, free images and photos that you can download and use for any project.",
    image_url: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop",
    target_url: "https://unsplash.com",
    category_id: "design"
  },
  {
    id: "15",
    title: "Procreate",
    description: "The most intuitive and feature-packed digital art app for iPad. Sketch, paint, and create anywhere.",
    image_url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
    target_url: "https://procreate.art",
    category_id: "design"
  },
  {
    id: "16",
    title: "Canva",
    description: "Design anything, publish anywhere. Beautiful designs, powerful features, and intuitive tools.",
    image_url: "https://images.unsplash.com/photo-1611095973362-862e8b40eb27?w=800&h=600&fit=crop",
    target_url: "https://canva.com",
    category_id: "design"
  }
];

const DemoPage = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [visibleItems, setVisibleItems] = useState<Record<string, number>>({});
  const [showMoreClicked, setShowMoreClicked] = useState<Record<string, boolean>>({});
  
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const navRef = useRef<HTMLElement | null>(null);
  const navScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Initialize visible items count for each category
    const initialVisibleItems: Record<string, number> = {};
    const initialShowMore: Record<string, boolean> = {};
    
    demoCategories.forEach(category => {
      const categoryItems = getItemsByCategory(category.id);
      initialVisibleItems[category.id] = Math.min(12, categoryItems.length);
      initialShowMore[category.id] = false;
    });
    
    setVisibleItems(initialVisibleItems);
    setShowMoreClicked(initialShowMore);
  }, []);

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
      const scrollPosition = window.scrollY + 200;
      
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
  }, []);

  // Auto-scroll navigation to active category
  useEffect(() => {
    if (activeCategory && navScrollRef.current) {
      const activeButton = navScrollRef.current.querySelector(`[data-category="${activeCategory}"]`) as HTMLElement;
      if (activeButton) {
        activeButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeCategory]);

  const getItemsByCategory = (categoryId: string | null) => {
    return demoItems.filter(item => item.category_id === categoryId);
  };
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const scrollToCategory = (categoryId: string) => {
    const element = categoryRefs.current[categoryId];
    if (element) {
      setActiveCategory(categoryId);
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleShowMore = (categoryId: string) => {
    const categoryItems = getItemsByCategory(categoryId);
    
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
    const categoryItems = getItemsByCategory(categoryId);
    return categoryItems.length > 10 && !showMoreClicked[categoryId];
  };

  const getVisibleItems = (categoryId: string) => {
    const categoryItems = getItemsByCategory(categoryId);
    const visibleCount = visibleItems[categoryId] || 12;
    return categoryItems.slice(0, visibleCount);
  };

  const handleItemClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const sanitizeText = (text: string) => text; // Demo version doesn't need sanitization

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Header />

      {/* Hero Section - Conditional based on use_avatar_background */}
      {demoProfile.use_avatar_background && demoProfile.avatar_url ? (
        /* Background Hero Layout */
        <div className="relative h-[80vh] w-full pt-20">
          {/* Background Image with Smooth Fade Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-fade-in"
            style={{ backgroundImage: `url(${demoProfile.avatar_url})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-transparent" />
            {/* Smooth transition to background */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
          </div>
          
          {/* Content positioned at very bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-6">
            <div className="text-center animate-fade-in max-w-4xl mx-auto">
              <div className="space-y-2">
                <h1 
                  className="text-xl md:text-2xl font-bold drop-shadow-lg text-white"
                >
                  {demoProfile.display_name}
                </h1>
                <p 
                  className="text-base md:text-lg font-mono drop-shadow-md text-gray-300"
                >
                  @{demoProfile.username}
                </p>
                <h2 
                  className="text-lg md:text-xl font-semibold drop-shadow-md text-white"
                >
                  {demoProfile.page_title}
                </h2>
                <p 
                  className="text-sm md:text-base leading-relaxed drop-shadow-md text-gray-300 max-w-2xl mx-auto"
                >
                  {demoProfile.page_description}
                </p>
                
                {/* Demo-only Social Icons (no links) */}
                <div className="flex justify-center gap-4 mt-4 text-foreground">
                  <Youtube size={20} />
                  <Twitter size={20} />
                  <Linkedin size={20} />
                  <Instagram size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Compact Layout */
        <main className="container mx-auto px-6 py-6 pt-24">
          <div className="relative mb-8 rounded-xl border border-border/50 overflow-hidden shadow-card animate-fade-in">
            <div className="relative px-4 py-6 text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="w-16 h-16 border-2 border-background shadow-elegant">
                  <AvatarImage src={demoProfile.avatar_url} alt={demoProfile.display_name} />
                  <AvatarFallback className="text-lg font-bold bg-gradient-primary text-primary-foreground">
                    {getInitials(demoProfile.display_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="space-y-2">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-1">
                    {demoProfile.display_name}
                  </h1>
                  <p className="text-sm font-mono text-muted-foreground">
                    @{demoProfile.username}
                  </p>
                </div>
                
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-lg font-semibold mb-2">
                    {demoProfile.page_title}
                  </h2>
                   <p className="text-base leading-relaxed text-muted-foreground">
                     {demoProfile.page_description}
                   </p>
                   
                  {/* Demo-only Social Icons (no links) */}
                  <div className="flex justify-center gap-4 mt-4 text-foreground">
                    <Youtube size={20} />
                    <Twitter size={20} />
                    <Linkedin size={20} />
                    <Instagram size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
      
      {/* Categories and Content Section */}
      <main className={`px-6 py-6 ${demoProfile.use_avatar_background && demoProfile.avatar_url ? "container mx-auto" : ""}`}>

        {/* Sticky Category Navigation */}
        <nav 
          ref={navRef}
          className="bg-background/80 backdrop-blur-md border border-border/50 rounded-xl p-4 mb-8 transition-all duration-300 z-50"
          style={{ position: 'sticky', top: '1rem' }}
        >
          <div className="relative">
            {/* Scroll indicators for mobile */}
            <div className="md:hidden absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background/80 to-transparent pointer-events-none z-10 rounded-l-lg"></div>
            <div className="md:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background/80 to-transparent pointer-events-none z-10 rounded-r-lg"></div>
            
            <div 
              ref={navScrollRef}
              className="flex md:flex-wrap md:justify-center gap-4 overflow-x-auto md:overflow-x-visible scroll-smooth snap-x snap-mandatory scrollbar-hide px-2 md:px-0"
            >
              {demoCategories.map((category) => (
                <button
                  key={category.id}
                  data-category={category.id}
                  onClick={() => scrollToCategory(category.id)}
                  className={`flex-shrink-0 px-6 py-3 rounded-lg font-medium transition-all duration-200 snap-center whitespace-nowrap ${
                    activeCategory === category.id
                      ? 'bg-primary text-primary-foreground shadow-md scale-105'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Categories with Items */}
        <div className="space-y-16 max-w-6xl mx-auto">
          {demoCategories.map((category, index) => {
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
                className="relative rounded-3xl overflow-hidden shadow-card animate-fade-in scroll-mt-24"
              >
                <div className={`absolute inset-0 ${gradientClass} opacity-10`}></div>
                <div className="relative px-6 py-12 space-y-8">
                  <div className="text-center animate-fade-in">
                    <h2 
                      className="text-3xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent preserve-emoji-colors"
                      dangerouslySetInnerHTML={{ __html: sanitizeText(category.name) }}
                    />
                    {category.description && (
                      <p 
                        className="text-lg text-muted-foreground max-w-2xl mx-auto preserve-emoji-colors"
                        dangerouslySetInnerHTML={{ __html: sanitizeText(category.description) }}
                      />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
                    {visibleCategoryItems.map((item) => (
                      <Card 
                        key={item.id} 
                        className="overflow-hidden bg-gradient-card border-border/50 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                        onClick={() => handleItemClick(item.target_url)}
                      >
                        <div className="aspect-video w-full overflow-hidden">
                          <img 
                            src={item.image_url} 
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                 />
                 
                    {/* Note: Social media links hidden for security in this demo */}
                 </div>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                              {item.title}
                            </h3>
                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                          </div>
                          <p className="text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Show More Button */}
                  {shouldShowMoreButton(category.id) && (
                    <div className="text-center pt-6 animate-fade-in">
                      <Button
                        variant="outline"
                        onClick={() => handleShowMore(category.id)}
                        className="px-8 py-2 hover-scale"
                      >
                        Show More ({categoryItems.length - (visibleItems[category.id] || 12)} more items)
                      </Button>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 pt-12 border-t border-border/50 animate-fade-in">
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto animate-fade-in">{" "}
            <h3 className="text-2xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Create Your Own Curately Page
            </h3>
            <p className="text-muted-foreground mb-6">
              Build your own beautiful recommendation page and share your favorite tools, products, and resources with the world.
            </p>
            <Link 
              to="/auth" 
              className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-medium transition-colors hover:bg-primary/90"
            >
              Get Started Free
            </Link>
          </div>
        </div>

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

export default DemoPage;