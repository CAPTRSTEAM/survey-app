import React from 'react'
import {
  Box,
  Typography,
  TextField,
  Grid,
  Paper,
  Alert
} from '@mui/material'

import { Survey } from '../../types/survey'

interface ThankYouStepProps {
  data: any
  survey: Survey
  onChange: (data: any) => void
}

export const ThankYouStep: React.FC<ThankYouStepProps> = ({
  data,
  survey,
  onChange
}) => {
  const handleChange = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value
    })
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Thank You Section
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Create a thank you message that participants will see when they complete the survey.
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        A good thank you message should acknowledge the participant's time, 
        explain what happens next, and provide any relevant contact information.
      </Alert>
      
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Thank You Title"
              value={data.title || survey.thankYou.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Thank you for your participation"
              helperText="A brief, appreciative title for the completion screen"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Thank You Message"
              value={data.message || survey.thankYou.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="Thank you for taking the time to complete our survey. Your feedback is valuable and will help us improve our services. We appreciate your participation and will use your responses to make positive changes."
              helperText="Provide a warm, appreciative message that acknowledges their time and explains next steps"
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
} 