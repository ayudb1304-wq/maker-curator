import React from 'react';
import { X } from 'lucide-react';
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
    <>
      <div className="relative">
        {/* Image */}
        <div className="aspect-video w-full overflow-hidden rounded-lg mb-6">
          <img 
            src={item.image_url} 
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Category Badge */}
        {category && (
          <div className="mb-4">
            <Badge variant="secondary" className="text-sm">
              <span dangerouslySetInnerHTML={{ __html: sanitizeText(category.name) }} />
            </Badge>
          </div>
        )}

        {/* Title */}
        <h2 
          className="text-2xl font-bold mb-4 preserve-emoji-colors"
          dangerouslySetInnerHTML={{ __html: sanitizeText(item.title) }}
        />

        {/* Description */}
        {item.description && (
          <div className="mb-6">
            <p 
              className="text-muted-foreground leading-relaxed preserve-emoji-colors"
              dangerouslySetInnerHTML={{ __html: sanitizeText(item.description) }}
            />
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="pt-4 flex justify-center">
        <button 
          onClick={handleVisitLink}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
        >
          <img 
            src="/lovable-uploads/1edf8796-86e3-4b7a-8081-247f973203a3.png" 
            alt="Visit" 
            className="w-5 h-5"
          />
          <span className="font-medium">Visit</span>
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-4 top-4 z-10 p-2"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="px-4 pb-4 overflow-y-auto">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute right-4 top-4 z-10 p-2"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="pt-6">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}