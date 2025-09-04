import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Palette } from 'lucide-react';

// Mock data - in real app this would come from database
const getMockUserData = (username: string) => {
  return {
    username,
    pageTitle: 'My Favorite Tech Gear',
    pageDescription: 'A curated list of the tools I use every day to create my content.',
    items: [
      {
        id: '1',
        title: 'MacBook Pro M3',
        description: 'The best laptop for creative work. Incredible performance and battery life.',
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
        targetUrl: 'https://apple.com'
      },
      {
        id: '2',
        title: 'Sony WH-1000XM5 Headphones',
        description: 'Amazing noise cancellation and sound quality for focus work.',
        imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop',
        targetUrl: 'https://sony.com'
      },
      {
        id: '3',
        title: 'Notion Productivity Suite',
        description: 'My go-to app for organizing projects, notes, and daily planning.',
        imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
        targetUrl: 'https://notion.so'
      }
    ]
  };
};

const PublicPage = () => {
  const { username } = useParams<{ username: string }>();
  
  if (!username) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground">The requested user page could not be found.</p>
        </div>
      </div>
    );
  }

  const userData = getMockUserData(username);

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
                Curator
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
            {userData.pageTitle}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {userData.pageDescription}
          </p>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {userData.items.map((item) => (
            <Card 
              key={item.id} 
              className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              onClick={() => window.open(item.targetUrl, '_blank')}
            >
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={item.imageUrl} 
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

        {/* Footer */}
        <footer className="text-center mt-16 pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Powered by{' '}
            <Link 
              to="/" 
              className="text-primary hover:underline font-medium"
            >
              Curator
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default PublicPage;