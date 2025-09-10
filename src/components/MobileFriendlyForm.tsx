import * as React from "react"
import { ResponsiveModal } from "@/components/ui/responsive-modal"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface MobileFriendlyFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  onSubmit: () => void
  onCancel?: () => void
  submitText?: string
  cancelText?: string
  children: React.ReactNode
  disabled?: boolean
  isLoading?: boolean
}

export function MobileFriendlyForm({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  onCancel,
  submitText = "Save",
  cancelText = "Cancel",
  children,
  disabled = false,
  isLoading = false
}: MobileFriendlyFormProps) {
  const isMobile = useIsMobile()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      onOpenChange(false)
    }
  }

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      className={isMobile ? "max-h-[95vh]" : undefined}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Close button for mobile - top right */}
        {isMobile && (
          <div className="flex justify-end -mt-2 -mr-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-10 w-10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Form content */}
        <div className={isMobile ? "space-y-6" : "space-y-4"}>
          {children}
        </div>

        {/* Action buttons */}
        <div className={`flex gap-3 ${isMobile ? 'flex-col pt-4' : 'flex-row-reverse'}`}>
          <Button 
            type="submit"
            size={isMobile ? "mobile" : "default"}
            disabled={disabled || isLoading}
            className={isMobile ? "w-full order-1" : ""}
          >
            {isLoading ? "Saving..." : submitText}
          </Button>
          <Button
            type="button"
            variant="outline"
            size={isMobile ? "mobile" : "default"}
            onClick={handleCancel}
            className={isMobile ? "w-full order-2" : ""}
          >
            {cancelText}
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  )
}