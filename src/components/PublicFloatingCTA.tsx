import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const PublicFloatingCTA = () => {
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
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 animate-fade-in safe-area-inset-bottom w-full max-w-lg px-4">
      <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-full shadow-elegant px-6 py-3 flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/1edf8796-86e3-4b7a-8081-247f973203a3.png" 
            alt="Curately Logo" 
            className="w-6 h-6 flex-shrink-0"
          />
          <span className="text-sm font-medium text-foreground">Curately</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button 
              size="sm" 
              className="bg-gradient-primary hover:opacity-90 transition-opacity text-sm px-4 py-2 h-8"
            >
              Claim your Username
            </Button>
          </Link>
          
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 flex-shrink-0 ml-2"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicFloatingCTA;