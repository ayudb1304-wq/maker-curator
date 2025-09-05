import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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
  user_id: string;
}

const demoProfile: DemoProfile = {
  username: "demo",
  display_name: "Alex Chen",
  page_title: "Alex's Curated Recommendations",
  page_description: "A carefully curated collection of my favorite tools, products, and resources that make life better.",
  avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  user_id: "demo-user"
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
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/1edf8796-86e3-4b7a-8081-247f973203a3.png" 
                alt="Curately Logo" 
                className="w-8 h-8"
              />
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Curately
              </span>
            </Link>
            <div className="text-sm text-muted-foreground">
              @{demoProfile.username} • Demo Page
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
                <AvatarImage src={demoProfile.avatar_url} alt={demoProfile.display_name} />
                <AvatarFallback className="text-3xl font-bold bg-gradient-primary text-primary-foreground">
                  {getInitials(demoProfile.display_name)}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="space-y-4">
              <div>
                <h1 className="text-5xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                  {demoProfile.display_name}
                </h1>
                <p className="text-lg text-muted-foreground font-mono">@{demoProfile.username}</p>
              </div>
              
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-semibold mb-3">
                  {demoProfile.page_title}
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {demoProfile.page_description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Category Navigation */}
        <nav 
          ref={navRef}
          className="bg-background/80 backdrop-blur-md border border-border/50 rounded-xl p-4 mb-8 transition-all duration-300 z-50"
          style={{ position: 'sticky', top: '1rem' }}
        >
          <div className="flex flex-wrap gap-4 justify-center">
            {demoCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {category.name}
              </button>
            ))}
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
                className="relative rounded-3xl overflow-hidden shadow-card"
              >
                <div className={`absolute inset-0 ${gradientClass} opacity-10`}></div>
                <div className="relative px-6 py-12 space-y-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
                      {category.name}
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      {category.description}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 pt-12 border-t border-border/50">
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
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