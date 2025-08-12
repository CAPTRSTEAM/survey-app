import React from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Alert
} from '@mui/material'
import {
  Warning as WarningIcon
} from '@mui/icons-material'

import { Survey } from '../../types/survey'
import { getQuestionTypeLabel, getTotalQuestions } from '../../utils/surveyUtils'

interface ReviewStepProps {
  survey: Survey
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  survey
}) => {
  const hasQuestions = getTotalQuestions(survey) > 0
  const hasWelcome = survey.welcome.title.trim() && survey.welcome.message.trim()
  const hasThankYou = survey.thankYou.title.trim() && survey.thankYou.message.trim()
  const hasTitle = survey.title.trim()
  const hasDescription = survey.description.trim()

  const isComplete = hasQuestions && hasWelcome && hasThankYou && hasTitle

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review Your Survey
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review all the information before creating your survey. Make sure everything looks correct.
      </Typography>

      {!isComplete && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <WarningIcon sx={{ mr: 1 }} />
          Please complete all required sections before creating your survey.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Survey Title
              </Typography>
              <Typography variant="body1">
                {hasTitle ? survey.title : 'Not provided'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1">
                {hasDescription ? survey.description : 'Not provided'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Welcome Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Welcome Section
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Welcome Title
              </Typography>
              <Typography variant="body1">
                {hasWelcome ? survey.welcome.title : 'Not provided'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Welcome Message
              </Typography>
              <Typography variant="body1">
                {hasWelcome ? survey.welcome.message.substring(0, 100) + '...' : 'Not provided'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Questions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Questions ({getTotalQuestions(survey)} total questions in {survey.sections.length} sections)
            </Typography>
            {hasQuestions ? (
              <Box>
                {survey.sections.map((section, sectionIndex) => (
                  <Box key={section.id} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Section {sectionIndex + 1}: {section.title}
                      </Typography>
                      <Chip 
                        label={`${section.questions.length} questions`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {section.description}
                    </Typography>
                    {section.questions.map((question, questionIndex) => (
                      <Box key={question.id} sx={{ mb: 2, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="subtitle1">
                            {questionIndex + 1}. {question.question}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                              label={getQuestionTypeLabel(question.type)} 
                              size="small" 
                              variant="outlined"
                            />
                            <Chip 
                              label={question.required ? 'Required' : 'Optional'} 
                              size="small" 
                              color={question.required ? 'primary' : 'default'}
                            />
                          </Box>
                        </Box>
                        {question.options && question.options.length > 0 && (
                          <Typography variant="body2" color="text.secondary">
                            Options: {question.options.join(', ')}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No questions added yet.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Thank You Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thank You Section
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Thank You Title
              </Typography>
              <Typography variant="body1">
                {hasThankYou ? survey.thankYou.title : 'Not provided'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Thank You Message
              </Typography>
              <Typography variant="body1">
                {hasThankYou ? survey.thankYou.message : 'Not provided'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>


    </Box>
  )
} 