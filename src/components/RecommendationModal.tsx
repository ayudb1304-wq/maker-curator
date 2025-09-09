import React from 'react';
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
      <div className="pt-4">
        <Button 
          onClick={handleVisitLink}
          className="w-full gap-2"
          size="lg"
        >
          <ExternalLink className="w-4 h-4" />
          Visit Link
        </Button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerClose asChild>
              <Button variant="ghost" size="sm" className="absolute right-4 top-4 p-2">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>
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
        <DialogClose asChild>
          <Button variant="ghost" size="sm" className="absolute right-4 top-4 p-2">
            <X className="h-4 w-4" />
          </Button>
        </DialogClose>
        <div className="pt-6">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}