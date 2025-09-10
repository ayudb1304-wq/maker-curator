import React, { useState, useEffect, useRef } from 'react';
import { PreserveEmojiText } from '@/lib/emoji';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { safeOpenUrl } from '@/lib/security';
import { useIsMobile } from '@/hooks/use-mobile';

interface Item {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  long_description?: string;
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

interface EnhancedRecommendationModalProps {
  item: Item | null;
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allItems?: Item[];
  onNavigate?: (item: Item) => void;
}

export function EnhancedRecommendationModal({
  item,
  category,
  open,
  onOpenChange,
  allItems = [],
  onNavigate
}: EnhancedRecommendationModalProps) {
  const isMobile = useIsMobile();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!item) return null;

  const currentIndex = allItems.findIndex(i => i.id === item.id);
  const hasNavigation = allItems.length > 1 && onNavigate;
  const canGoPrevious = hasNavigation && currentIndex > 0;
  const canGoNext = hasNavigation && currentIndex < allItems.length - 1;

  const handleVisitLink = () => {
    if (item.target_url) {
      safeOpenUrl(item.target_url);
      onOpenChange(false);
    }
  };

  const navigateTo = (direction: 'prev' | 'next') => {
    if (!hasNavigation) return;
    
    let newIndex = currentIndex;
    if (direction === 'prev' && canGoPrevious) {
      newIndex = currentIndex - 1;
    } else if (direction === 'next' && canGoNext) {
      newIndex = currentIndex + 1;
    }
    
    if (newIndex !== currentIndex && allItems[newIndex]) {
      onNavigate!(allItems[newIndex]);
    }
  };

  // Swipe gesture handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && canGoNext) {
      navigateTo('next');
    }
    if (isRightSwipe && canGoPrevious) {
      navigateTo('prev');
    }
  };

  const content = (
    <div
      ref={contentRef}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchMove={isMobile ? handleTouchMove : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
      className="space-y-6"
    >
      {/* Navigation indicators for mobile */}
      {isMobile && hasNavigation && (
        <div className="flex justify-center gap-2 pb-2">
          {allItems.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      )}

      {/* Image with navigation */}
      <div className="relative">
        <div className={`w-full overflow-hidden rounded-lg ${isMobile ? 'max-h-72' : 'max-h-96'}`}>
          <img 
            src={item.image_url} 
            alt={item.title}
            className={`w-full h-auto object-contain ${isMobile ? 'max-h-72' : 'max-h-96'}`}
            loading="lazy"
          />
        </div>

        {/* Desktop navigation buttons */}
        {!isMobile && hasNavigation && (
          <>
            {canGoPrevious && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                onClick={() => navigateTo('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            {canGoNext && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                onClick={() => navigateTo('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </>
        )}
      </div>

      {/* Category Badge */}
      {category && (
        <div>
          <Badge variant="secondary" className={`${isMobile ? 'text-base px-4 py-2' : 'text-sm'}`}>
            <PreserveEmojiText>{category.name}</PreserveEmojiText>
          </Badge>
        </div>
      )}

      {/* Title */}
      <PreserveEmojiText
        as="h2"
        className={`font-bold ${isMobile ? 'text-3xl' : 'text-2xl'}`}
      >
        {item.title}
      </PreserveEmojiText>

      {/* Description */}
      {(item.long_description || item.description) && (
        <div>
          <PreserveEmojiText
            as="p"
            className={`text-muted-foreground leading-relaxed ${isMobile ? 'text-base' : 'text-sm'}`}
          >
            {item.long_description || item.description}
          </PreserveEmojiText>
        </div>
      )}

      {/* Mobile navigation buttons */}
      {isMobile && hasNavigation && (
        <div className="flex justify-between gap-3">
          <Button
            variant="outline"
            size="mobile"
            onClick={() => navigateTo('prev')}
            disabled={!canGoPrevious}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="mobile"
            onClick={() => navigateTo('next')}
            disabled={!canGoNext}
            className="flex-1"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Visit Link Button */}
      {item.target_url && (
        <Button 
          onClick={handleVisitLink}
          className="w-full gap-3 font-medium bg-gradient-primary text-white hover:shadow-glow transition-all duration-300"
          size={isMobile ? "mobile" : "lg"}
        >
          <ExternalLink className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
          Visit Link
        </Button>
      )}

      {/* Swipe hint for mobile */}
      {isMobile && hasNavigation && (
        <p className="text-xs text-muted-foreground text-center">
          Swipe left or right to navigate between recommendations
        </p>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[95vh] overflow-y-auto">
          <DrawerHeader className="text-left px-6 pt-6 pb-2">
            <DrawerTitle className="sr-only">Recommendation Details</DrawerTitle>
          </DrawerHeader>
          <div className="px-6 pb-8 pt-2">
            {content}
          </div>
          {/* Safe area for devices with home indicator */}
          <div className="h-[env(safe-area-inset-bottom,16px)]" />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Recommendation Details</DialogTitle>
        </DialogHeader>
        <div className="pt-6">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}