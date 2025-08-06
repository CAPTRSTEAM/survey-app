import React from 'react'
import {
  Box,
  Typography,
  TextField,
  Grid,
  Paper
} from '@mui/material'

import { Survey } from '../../types/survey'

interface BasicInfoStepProps {
  data: any
  survey: Survey
  onChange: (data: any) => void
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
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
        Basic Survey Information
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Provide the basic details for your survey. This information will be displayed to participants.
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Survey Title"
              value={data.title || survey.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter a descriptive title for your survey"
              helperText="This will be the main title shown to participants"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Survey Description"
              value={data.description || survey.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe what this survey is about and what participants can expect"
              helperText="Provide context about the survey purpose and estimated completion time"
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
} 