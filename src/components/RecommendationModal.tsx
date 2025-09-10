import React from 'react';
import { PreserveEmojiText } from '@/lib/emoji';
import { ExternalLink, X } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { safeOpenUrl, sanitizeText } from '@/lib/security';
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

interface RecommendationModalProps {
  item: Item | null;
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecommendationModal({ item, category, open, onOpenChange }: RecommendationModalProps) {
  const isMobile = useIsMobile();

  if (!item) return null;

  const handleVisitLink = () => {
    safeOpenUrl(item.target_url);
    onOpenChange(false);
  };

  const content = (
    <div className="flex flex-col h-full">
      <div className="relative flex-shrink-0">
        {/* Image - Enhanced mobile display */}
        <div className={`w-full overflow-hidden rounded-lg mb-6 ${isMobile ? 'max-h-72' : 'max-h-96'}`}>
          <img 
            src={item.image_url} 
            alt={item.title}
            className={`w-full h-auto object-contain ${isMobile ? 'max-h-72' : 'max-h-96'}`}
            loading="lazy"
          />
        </div>

        {/* Category Badge */}
        {category && (
          <div className="mb-4">
            <Badge variant="secondary" className={`${isMobile ? 'text-base px-4 py-2' : 'text-sm'}`}>
              <PreserveEmojiText>{category.name}</PreserveEmojiText>
            </Badge>
          </div>
        )}

        {/* Title */}
        <PreserveEmojiText
          as="h2"
          className={`font-bold mb-4 ${isMobile ? 'text-3xl' : 'text-2xl'}`}
        >
          {item.title}
        </PreserveEmojiText>

        {/* Description */}
        {(item.long_description || item.description) && (
          <div className="mb-6 flex-1 min-h-0">
            <PreserveEmojiText
              as="p"
              className={`text-muted-foreground leading-relaxed ${isMobile ? 'text-base' : 'text-sm'} whitespace-pre-wrap`}
            >
              {item.long_description || item.description}
            </PreserveEmojiText>
          </div>
        )}
      </div>

      {/* Action Button - Enhanced for mobile */}
      <div className="pt-4 flex-shrink-0">
        <Button 
          onClick={handleVisitLink}
          className="w-full gap-3 font-medium bg-gradient-primary text-white hover:shadow-glow transition-all duration-300"
          size={isMobile ? "mobile" : "lg"}
        >
          <ExternalLink className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
          Visit Link
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[95vh] flex flex-col">
          <DrawerHeader className="text-left px-6 pt-6 pb-2 flex-shrink-0">
            <DrawerTitle className="sr-only">Recommendation Details</DrawerTitle>
          </DrawerHeader>
          <div className="px-6 pb-8 pt-2 overflow-y-auto flex-1">
            {content}
          </div>
          {/* Safe area for devices with home indicator */}
          <div className="h-[env(safe-area-inset-bottom,16px)] flex-shrink-0" />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
        </DialogHeader>
        <div className="pt-6 overflow-y-auto flex-1">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}