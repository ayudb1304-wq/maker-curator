import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const FloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA after scrolling 200px down
      const shouldShow = window.scrollY > 200;
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
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 animate-fade-in">
      <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-full shadow-elegant px-6 py-3 flex items-center gap-4 mx-4 max-w-sm">
        <div className="flex items-center gap-3 flex-1">
          <img 
            src="/lovable-uploads/1edf8796-86e3-4b7a-8081-247f973203a3.png" 
            alt="Curately Logo" 
            className="w-6 h-6"
          />
          <span className="text-sm font-medium text-foreground">Curately</span>
        </div>
        
        <Link to="/auth">
          <Button 
            size="sm" 
            className="bg-gradient-primary hover:opacity-90 transition-opacity text-xs px-4 py-2 h-8"
          >
            Try for free!
          </Button>
        </Link>
        
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FloatingCTA;