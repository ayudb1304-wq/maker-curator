import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Palette } from 'lucide-react';

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

const demoProfile = {
  username: "demo",
  page_title: "Alex's Curated Recommendations",
  page_description: "A carefully curated collection of my favorite tools, products, and resources that make life better."
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
  // Tech & Productivity
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

  // Lifestyle & Wellness
  {
    id: "4",
    title: "Headspace",
    description: "Meditation and mindfulness made simple. Guided meditations, sleep stories, and breathing exercises.",
    image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    target_url: "https://headspace.com",
    category_id: "lifestyle"
  },
  {
    id: "5",
    title: "Theragun",
    description: "Percussive therapy device that helps you recover faster, train harder, and sleep better.",
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
    target_url: "https://theragun.com",
    category_id: "lifestyle"
  },
  {
    id: "6",
    title: "Oura Ring",
    description: "Track your sleep, recovery, and readiness with this stylish smart ring that provides personalized insights.",
    image_url: "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800&h=600&fit=crop",
    target_url: "https://ouraring.com",
    category_id: "lifestyle"
  },

  // Learning & Growth
  {
    id: "7",
    title: "MasterClass",
    description: "Learn from the world's best instructors. 180+ classes from Gordon Ramsay, Neil Gaiman, and more.",
    image_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop",
    target_url: "https://masterclass.com",
    category_id: "learning"
  },
  {
    id: "8",
    title: "Blinkist",
    description: "Get the key insights from top nonfiction books in text or audio — in just 15 minutes.",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
    target_url: "https://blinkist.com",
    category_id: "learning"
  },
  {
    id: "9",
    title: "Duolingo",
    description: "Learn a language for free. Fun, effective, and 100% free language learning platform.",
    image_url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop",
    target_url: "https://duolingo.com",
    category_id: "learning"
  },

  // Design & Creativity
  {
    id: "10",
    title: "Figma",
    description: "The collaborative interface design tool. Design, prototype, and gather feedback all in one place.",
    image_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
    target_url: "https://figma.com",
    category_id: "design"
  },
  {
    id: "11",
    title: "Unsplash",
    description: "Beautiful, free images and photos that you can download and use for any project.",
    image_url: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop",
    target_url: "https://unsplash.com",
    category_id: "design"
  },
  {
    id: "12",
    title: "Procreate",
    description: "The most intuitive and feature-packed digital art app for iPad. Sketch, paint, and create anywhere.",
    image_url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
    target_url: "https://procreate.art",
    category_id: "design"
  }
];

const DemoPage = () => {
  const getItemsByCategory = (categoryId: string) => {
    return demoItems.filter(item => item.category_id === categoryId);
  };

  const handleItemClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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
              @{demoProfile.username} • Demo Page
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            {demoProfile.page_title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {demoProfile.page_description}
          </p>
        </div>

        {/* Categories with Items */}
        <div className="space-y-16 max-w-6xl mx-auto">
          {demoCategories.map((category) => {
            const categoryItems = getItemsByCategory(category.id);
            
            return (
              <section key={category.id} className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
                    {category.name}
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {category.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categoryItems.map((item) => (
                    <Card 
                      key={item.id} 
                      className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
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