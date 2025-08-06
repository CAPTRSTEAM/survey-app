import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress,
  IconButton
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Save as SaveIcon
} from '@mui/icons-material'

import { Survey } from '../types/survey'
import { useWizard } from '../hooks/useWizard'
import { useSurveyContext } from '../context/SurveyContext'
import { createNewSurvey } from '../utils/surveyUtils'
import { BasicInfoStep } from './wizard/BasicInfoStep'
import { WelcomeStep } from './wizard/WelcomeStep'
import { QuestionsStep } from './wizard/QuestionsStep'
import { ThankYouStep } from './wizard/ThankYouStep'
import { ReviewStep } from './wizard/ReviewStep'

interface SurveyWizardProps {
  survey?: Survey | null
  onComplete: (survey: Survey) => void
  onCancel: () => void
}

const WIZARD_STEPS = [
  { id: 'basic-info', title: 'Basic Information', description: 'Survey title and description' },
  { id: 'welcome', title: 'Welcome Section', description: 'Welcome message for participants' },
  { id: 'questions', title: 'Questions', description: 'Add and configure survey questions' },
  { id: 'thank-you', title: 'Thank You Section', description: 'Thank you message for participants' },
  { id: 'review', title: 'Review & Save', description: 'Review your survey and save' }
]

export const SurveyWizard: React.FC<SurveyWizardProps> = ({
  survey,
  onComplete,
  onCancel
}) => {
  const { updateSurvey, addSurvey } = useSurveyContext()
  const wizard = useWizard({
    steps: WIZARD_STEPS,
    initialStep: 0
  })
  
  const [currentSurvey, setCurrentSurvey] = useState<Survey>(() => {
    if (survey) {
      return { ...survey }
    }
    return createNewSurvey()
  })

  const prevSurveyRef = useRef(survey)

  // Reset wizard when survey prop changes (for new surveys)
  useEffect(() => {
    if (prevSurveyRef.current !== survey) {
      if (!survey) {
        // Creating a new survey - reset everything
        setCurrentSurvey(createNewSurvey())
        wizard.resetWizard()
      } else {
        // Editing existing survey
        setCurrentSurvey({ ...survey })
      }
      prevSurveyRef.current = survey
    }
  }, [survey])

  const handleStepDataChange = (stepId: string, data: any) => {
    wizard.setStepDataValue(stepId, data)
    
    // Update the current survey based on step data
    const updatedSurvey = { ...currentSurvey }
    
    switch (stepId) {
      case 'basic-info':
        updatedSurvey.title = data.title || currentSurvey.title
        updatedSurvey.description = data.description || currentSurvey.description
        break
      case 'welcome':
        updatedSurvey.welcome = {
          title: data.title || currentSurvey.welcome.title,
          message: data.message || currentSurvey.welcome.message
        }
        break
      case 'questions':
        updatedSurvey.sections = data.sections || currentSurvey.sections
        break
      case 'thank-you':
        updatedSurvey.thankYou = {
          title: data.title || currentSurvey.thankYou.title,
          message: data.message || currentSurvey.thankYou.message
        }
        break
    }
    
    setCurrentSurvey(updatedSurvey)
  }

  const handleComplete = () => {
    const finalSurvey = {
      ...currentSurvey,
      updatedAt: new Date().toISOString()
    }
    
    if (survey) {
      // Update existing survey
      updateSurvey(finalSurvey)
    } else {
      // Add new survey
      addSurvey(finalSurvey)
    }
    
    onComplete(finalSurvey)
  }

  const getStepContent = (stepId: string) => {
    const stepData = wizard.getStepData(stepId)
    
    switch (stepId) {
      case 'basic-info':
        return (
          <BasicInfoStep
            data={stepData}
            survey={currentSurvey}
            onChange={(data) => handleStepDataChange(stepId, data)}
          />
        )
      case 'welcome':
        return (
          <WelcomeStep
            data={stepData}
            survey={currentSurvey}
            onChange={(data) => handleStepDataChange(stepId, data)}
          />
        )
      case 'questions':
        return (
          <QuestionsStep
            data={stepData}
            survey={currentSurvey}
            onChange={(data) => handleStepDataChange(stepId, data)}
          />
        )
      case 'thank-you':
        return (
          <ThankYouStep
            data={stepData}
            survey={currentSurvey}
            onChange={(data) => handleStepDataChange(stepId, data)}
          />
        )
      case 'review':
        return (
          <ReviewStep
            survey={currentSurvey}
            onComplete={handleComplete}
          />
        )
      default:
        return null
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={onCancel} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            {survey ? 'Edit Survey' : 'Create New Survey'}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {survey ? 'Modify your survey settings and questions' : 'Build your survey step by step'}
          </Typography>
        </Box>
      </Box>

      {/* Progress */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Step {wizard.currentStepIndex + 1} of {wizard.totalSteps}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {wizard.currentStep.title}
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={((wizard.currentStepIndex + 1) / wizard.totalSteps) * 100}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Paper>

      {/* Stepper */}
      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={wizard.currentStepIndex} orientation="vertical">
          {WIZARD_STEPS.map((step) => (
            <Step key={step.id}>
              <StepLabel>{step.title}</StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  {getStepContent(step.id)}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={wizard.previousStep}
                    disabled={wizard.isFirstStep}
                    startIcon={<BackIcon />}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={wizard.nextStep}
                    disabled={wizard.isLastStep}
                    endIcon={<SaveIcon />}
                  >
                    Next
                  </Button>
                  {wizard.isLastStep && (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleComplete}
                      startIcon={<SaveIcon />}
                    >
                      Save Survey
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Container>
  )
} 