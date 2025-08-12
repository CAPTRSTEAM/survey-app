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
  Save as SaveIcon,
  Visibility as PreviewIcon
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
import { PreviewMode } from './PreviewMode'

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

  const [previewOpen, setPreviewOpen] = useState(false)

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
          />
        )
      default:
        return null
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#eef0f8' }}>
      {/* 3/4 Width Header Bar */}
      <Box sx={{ 
        background: '#181a43',
        color: 'white',
        position: 'fixed',
        top: 0,
        left: '12.5%',
        right: '12.5%',
        zIndex: 1200,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        px: 3,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
          {/* Back Button */}
          <IconButton onClick={onCancel} sx={{ mr: 2, color: 'white' }}>
            <BackIcon />
          </IconButton>
          
          {/* CAPTRS Logo */}
          <Box
            component="img"
            src="/CAPTRS_StackedLogo_White_Square-01-01.png"
            alt="CAPTRS Logo"
            sx={{
              height: 48,
              width: 'auto',
              filter: 'brightness(0) invert(1)',
              opacity: 0.95
            }}
          />
          
          {/* Application Title */}
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold',
            fontFamily: '"DM Sans", sans-serif',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            ml: 2
          }}>
            {survey ? 'Edit Survey' : 'Create New Survey'}
          </Typography>
        </Box>
        
        {/* Right side controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* User Profile Icon */}
          <Box sx={{ 
            width: 32, 
            height: 32, 
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white'
          }}>
            👤
          </Box>
        </Box>
      </Box>

             {/* Main Content with top padding for fixed header and bottom padding for fixed navigation */}
       <Container maxWidth="lg" sx={{ py: 4, pt: 16, pb: 20 }}>

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

       {/* Preview Button */}
       <Paper sx={{ p: 3, mb: 3 }}>
         <Box sx={{ display: 'flex', justifyContent: 'center' }}>
           <Button
             variant="outlined"
             startIcon={<PreviewIcon />}
             onClick={() => setPreviewOpen(true)}
             sx={{
               borderColor: '#4358a3',
               color: '#4358a3',
               px: 4,
               py: 1.5,
               '&:hover': {
                 borderColor: '#2b3d8b',
                 backgroundColor: 'rgba(67, 88, 163, 0.04)'
               }
             }}
           >
             Preview Survey
           </Button>
         </Box>
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
               </StepContent>
             </Step>
           ))}
         </Stepper>
       </Paper>
     </Container>

           {/* Fixed Bottom Navigation - 3/4 Width */}
      <Box sx={{
        position: 'fixed',
        bottom: 0,
        left: '12.5%',
        right: '12.5%',
        backgroundColor: 'white',
        borderTop: '1px solid #eef0f8',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
        zIndex: 1100,
        py: 3,
        px: 4,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Back Button - Left */}
          <Button
            variant="outlined"
            onClick={wizard.previousStep}
            disabled={wizard.isFirstStep}
            startIcon={<BackIcon />}
            sx={{ minWidth: 100 }}
          >
            Back
          </Button>
          
          {/* Next/Save Button - Right */}
          {!wizard.isLastStep ? (
            <Button
              variant="contained"
              onClick={wizard.nextStep}
              endIcon={<SaveIcon />}
              sx={{ 
                minWidth: 120,
                background: 'linear-gradient(45deg, #181a43 0%, #4358a3 100%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #2b3d8b 0%, #4358a3 100%)',
                }
              }}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              onClick={handleComplete}
              startIcon={<SaveIcon />}
              sx={{ 
                minWidth: 140,
                background: 'linear-gradient(45deg, #2e7d32 0%, #4caf50 100%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1b5e20 0%, #388e3c 100%)',
                }
              }}
            >
              Save Survey
            </Button>
          )}
        </Box>
      </Box>

      {/* Preview Mode */}
      <PreviewMode
        survey={currentSurvey}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
  </Box>
  )
} 