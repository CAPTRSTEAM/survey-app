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

interface WelcomeStepProps {
  data: any
  survey: Survey
  onChange: (data: any) => void
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({
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
        Welcome Section
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Create a welcoming message that participants will see when they start the survey.
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        A good welcome message should explain the purpose of the survey, how long it will take, 
        and what participants can expect.
      </Alert>
      
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Welcome Title"
              value={data.title || survey.welcome.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Welcome to our survey"
              helperText="A brief, friendly title for the welcome screen"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Welcome Message"
              value={data.message || survey.welcome.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="Thank you for participating in our survey. This will help us understand your needs and improve our services. The survey should take about 5-10 minutes to complete."
              helperText="Provide a clear, welcoming message that sets expectations"
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
} 