import * as React from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { ResponsiveModal } from "@/components/ui/responsive-modal"

interface StepProps {
  title: string
  description?: string
  children: React.ReactNode
  isValid?: boolean
}

interface MultiStepFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  steps: StepProps[]
  onSubmit: () => void
  onCancel?: () => void
  submitText?: string
  cancelText?: string
  isLoading?: boolean
  currentStep?: number
  onStepChange?: (step: number) => void
}

export function MultiStepForm({
  open,
  onOpenChange,
  title,
  steps,
  onSubmit,
  onCancel,
  submitText = "Save",
  cancelText = "Cancel",
  isLoading = false,
  currentStep: controlledStep,
  onStepChange
}: MultiStepFormProps) {
  const [internalStep, setInternalStep] = React.useState(0)
  const isMobile = useIsMobile()
  
  const currentStep = controlledStep !== undefined ? controlledStep : internalStep
  const setCurrentStep = onStepChange || setInternalStep
  
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isLastStep) {
      onSubmit()
    } else {
      handleNext()
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      onOpenChange(false)
    }
    setCurrentStep(0)
  }

  const currentStepData = steps[currentStep]
  const canProceed = currentStepData?.isValid !== false

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) setCurrentStep(0)
      }}
      title={title}
      className={isMobile ? "max-h-[95vh]" : undefined}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Progress indicator */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step header */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
          {currentStepData.description && (
            <p className="text-sm text-muted-foreground">
              {currentStepData.description}
            </p>
          )}
        </div>

        {/* Step content */}
        <div className={`space-y-6 ${isMobile ? 'min-h-[300px]' : 'min-h-[200px]'}`}>
          {currentStepData.children}
        </div>

        {/* Navigation buttons */}
        <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'flex-row-reverse'}`}>
          <Button 
            type="submit"
            size={isMobile ? "mobile" : "default"}
            disabled={!canProceed || isLoading}
            className={isMobile ? "w-full order-1" : ""}
          >
            {isLoading ? "Saving..." : isLastStep ? submitText : "Next"}
            {!isLastStep && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
          
          {!isFirstStep && (
            <Button
              type="button"
              variant="outline"
              size={isMobile ? "mobile" : "default"}
              onClick={handlePrevious}
              className={isMobile ? "w-full order-2" : ""}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          )}
          
          <Button
            type="button"
            variant="ghost"
            size={isMobile ? "mobile" : "default"}
            onClick={handleCancel}
            className={isMobile ? "w-full order-3" : ""}
          >
            {cancelText}
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  )
}

export type { StepProps }