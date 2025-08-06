import { useState, useCallback } from 'react'

export interface WizardStep {
  id: string
  title: string
  description?: string
}

export interface UseWizardProps {
  steps: WizardStep[]
  initialStep?: number
}

export const useWizard = ({ steps, initialStep = 0 }: UseWizardProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStep)
  const [stepData, setStepData] = useState<Record<string, any>>({})

  const currentStep = steps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStepIndex(stepIndex)
    }
  }, [steps.length])

  const nextStep = useCallback(() => {
    if (!isLastStep) {
      setCurrentStepIndex(prev => prev + 1)
    }
  }, [isLastStep])

  const previousStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }, [isFirstStep])

  const goToStepById = useCallback((stepId: string) => {
    const stepIndex = steps.findIndex(step => step.id === stepId)
    if (stepIndex !== -1) {
      setCurrentStepIndex(stepIndex)
    }
  }, [steps])

  const setStepDataValue = useCallback((stepId: string, data: any) => {
    setStepData(prev => ({
      ...prev,
      [stepId]: { ...prev[stepId], ...data }
    }))
  }, [])

  const getStepData = useCallback((stepId: string) => {
    return stepData[stepId] || {}
  }, [stepData])

  const resetWizard = useCallback(() => {
    setCurrentStepIndex(initialStep)
    setStepData({})
  }, [initialStep])

  return {
    currentStep,
    currentStepIndex,
    isFirstStep,
    isLastStep,
    totalSteps: steps.length,
    goToStep,
    nextStep,
    previousStep,
    goToStepById,
    setStepDataValue,
    getStepData,
    resetWizard,
    stepData
  }
} 