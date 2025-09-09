import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const FloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.getElementById('page-footer');
      const footerRect = footer?.getBoundingClientRect();
      const isFooterVisible = footerRect && footerRect.top < window.innerHeight;
      
      // Show CTA after scrolling 200px down, but hide when footer is visible
      const shouldShow = window.scrollY > 200 && !isFooterVisible;
      setIsVisible(shouldShow && !isDismissed);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 animate-fade-in safe-area-inset-bottom">
      <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-full shadow-elegant px-4 py-2 flex items-center gap-2 mx-4 max-w-sm">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <img 
            src="/lovable-uploads/1edf8796-86e3-4b7a-8081-247f973203a3.png" 
            alt="Curately Logo" 
            className="w-5 h-5 flex-shrink-0"
          />
          <span className="text-xs font-medium text-foreground">Curately</span>
        </div>
        
        <Link to="/auth">
          <Button 
            size="sm" 
            className="bg-gradient-primary hover:opacity-90 transition-opacity text-xs px-2 py-1 h-7 flex-shrink-0"
          >
            Try free
          </Button>
        </Link>
        
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default FloatingCTA;