import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HexColorPicker } from 'react-colorful';
import { Palette, Check, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  presets?: string[];
}

export function ColorPicker({
  label,
  value,
  onChange,
  presets = [
    '#ffffff', '#000000', '#f3f4f6', '#374151',
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'
  ]
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempColor, setTempColor] = useState(value);
  const isMobile = useIsMobile();

  useEffect(() => {
    setTempColor(value);
  }, [value]);

  const handleSave = () => {
    onChange(tempColor);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempColor(value);
    setIsOpen(false);
  };

  const content = (
    <div className="space-y-6">
      {/* Color picker */}
      <div className="space-y-4">
        <div className="flex justify-center">
          <HexColorPicker
            color={tempColor}
            onChange={setTempColor}
            style={{
              width: isMobile ? '280px' : '200px',
              height: isMobile ? '280px' : '200px'
            }}
          />
        </div>

        {/* Current color display */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg border-2 border-border shadow-inner"
            style={{ backgroundColor: tempColor }}
          />
          <Input
            value={tempColor.toUpperCase()}
            onChange={(e) => setTempColor(e.target.value)}
            placeholder="#FFFFFF"
            className="font-mono text-sm"
            maxLength={7}
          />
        </div>
      </div>

      {/* Preset colors */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Quick Colors</Label>
        <div className="grid grid-cols-6 gap-2">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setTempColor(preset)}
              className={`w-8 h-8 rounded-md border-2 transition-all hover:scale-110 ${
                tempColor.toLowerCase() === preset.toLowerCase()
                  ? 'border-primary shadow-lg scale-110'
                  : 'border-border hover:border-primary/50'
              }`}
              style={{ backgroundColor: preset }}
            />
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'flex-row-reverse'}`}>
        <Button
          onClick={handleSave}
          size={isMobile ? "mobile" : "default"}
          className={isMobile ? "w-full" : ""}
        >
          <Check className="w-4 h-4 mr-2" />
          Apply Color
        </Button>
        <Button
          variant="outline"
          onClick={handleCancel}
          size={isMobile ? "mobile" : "default"}
          className={isMobile ? "w-full" : ""}
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );

  const modal = isMobile ? (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Choose {label} Color</DrawerTitle>
        </DrawerHeader>
        <div className="px-6 pb-8">
          {content}
        </div>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Choose {label} Color</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex gap-3">
          <Input
            value={value.toUpperCase()}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#FFFFFF"
            className="font-mono text-sm flex-1"
            maxLength={7}
          />
          <Button
            type="button"
            variant="outline"
            size={isMobile ? "mobile" : "icon"}
            onClick={() => setIsOpen(true)}
            className={isMobile ? "px-4" : ""}
          >
            <div
              className="w-4 h-4 rounded border border-border"
              style={{ backgroundColor: value }}
            />
            {isMobile && <Palette className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
      {modal}
    </>
  );
}