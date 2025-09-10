import React, { useState, useCallback, useEffect } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Crop, RotateCw, Download, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

interface EnhancedImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  onRemoveImage?: () => void;
  aspectRatio?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export function EnhancedImageUpload({
  onImageUploaded,
  currentImageUrl,
  onRemoveImage,
  aspectRatio,
  maxWidth = 800,
  maxHeight = 600
}: EnhancedImageUploadProps) {
  const [showCropModal, setShowCropModal] = useState(false);
  const [originalImage, setOriginalImage] = useState<string>('');
  const [croppedImage, setCroppedImage] = useState<string>('');
  const isMobile = useIsMobile();

  const handleImageSelected = useCallback((url: string) => {
    setOriginalImage(url);
    setShowCropModal(true);
  }, []);

  const handleCropComplete = useCallback((croppedUrl: string) => {
    setCroppedImage(croppedUrl);
    onImageUploaded(croppedUrl);
    setShowCropModal(false);
  }, [onImageUploaded]);

  const handleRemoveImage = useCallback(() => {
    if (onRemoveImage) {
      onRemoveImage();
    }
    setCroppedImage('');
    setOriginalImage('');
  }, [onRemoveImage]);

  const CropModal = () => {
    const content = (
      <div className="space-y-6">
        {/* Image preview */}
        <div className={`relative bg-muted rounded-lg overflow-hidden ${isMobile ? 'h-64' : 'h-80'}`}>
          {originalImage && (
            <img
              src={originalImage}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Crop tools - simplified for mobile */}
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            {isMobile 
              ? "Tap and drag to adjust the image position" 
              : "Use the tools below to crop and adjust your image"
            }
          </div>
          
          <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'flex-row justify-center'}`}>
            <Button
              type="button"
              variant="outline"
              size={isMobile ? "mobile" : "default"}
              onClick={() => handleCropComplete(originalImage)}
              className={isMobile ? "w-full" : ""}
            >
              <Download className="w-4 h-4 mr-2" />
              Use Original
            </Button>
            <Button
              type="button"
              variant="outline"
              size={isMobile ? "mobile" : "default"}
              onClick={() => setShowCropModal(false)}
              className={isMobile ? "w-full" : ""}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );

    if (isMobile) {
      return (
        <Drawer open={showCropModal} onOpenChange={setShowCropModal}>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader>
              <DrawerTitle>Adjust Image</DrawerTitle>
            </DrawerHeader>
            <div className="px-6 pb-8">
              {content}
            </div>
          </DrawerContent>
        </Drawer>
      );
    }

    return (
      <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adjust Image</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <div className="space-y-4">
        {/* Enhanced image preview */}
        {(currentImageUrl || croppedImage) ? (
          <div className="relative group">
            <img
              src={croppedImage || currentImageUrl}
              alt="Preview"
              className={`w-full object-cover rounded-lg border transition-all duration-200 ${
                isMobile ? 'h-56' : 'h-48'
              }`}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setOriginalImage(croppedImage || currentImageUrl || '');
                  setShowCropModal(true);
                }}
                className="bg-white/90 text-black hover:bg-white"
              >
                <Crop className="w-4 h-4 mr-2" />
                {isMobile ? 'Edit' : 'Crop'}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                className="bg-red-500/90 hover:bg-red-500"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <ImageUpload
            onImageUploaded={handleImageSelected}
            currentImageUrl={currentImageUrl}
            onRemoveImage={onRemoveImage}
          />
        )}

        {/* Image specs info */}
        {(currentImageUrl || croppedImage) && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Recommended size: {maxWidth} × {maxHeight}px</p>
            {aspectRatio && <p>• Aspect ratio: {aspectRatio}:1</p>}
            <p>• Supports: JPEG, PNG, GIF, WebP</p>
          </div>
        )}
      </div>

      <CropModal />
    </>
  );
}