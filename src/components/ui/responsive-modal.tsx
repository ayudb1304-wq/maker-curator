import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"

interface ResponsiveModalProps {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  className?: string
}

export function ResponsiveModal({
  children,
  open,
  onOpenChange,
  title,
  description,
  className
}: ResponsiveModalProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className={className}>
          {(title || description) && (
            <DrawerHeader className="text-left px-6 pt-6">
              {title && <DrawerTitle className="text-xl font-semibold">{title}</DrawerTitle>}
              {description && <DrawerDescription>{description}</DrawerDescription>}
            </DrawerHeader>
          )}
          <div className="px-6 pb-6 pt-4">
            {children}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  )
}

// Trigger components for compatibility
export function ResponsiveModalTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}