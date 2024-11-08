import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface StepNavigationProps {
  onPrevious: () => void
  onNext: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

export function StepNavigation({ onPrevious, onNext, isFirstStep, isLastStep }: StepNavigationProps) {
  return (
    <div className="flex justify-between">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep}
        className="w-32 text-black mx-2"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
      </Button>
      <Button
        onClick={onNext}
        disabled={isLastStep}
        className="w-32 mx-2"
      >
        Next <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}