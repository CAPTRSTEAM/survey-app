import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Grid,
  Chip,
  Tooltip,
  Paper,
  Divider
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Visibility as PreviewIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material'

import { Survey } from '../types/survey'
import { formatDate, getTotalQuestions } from '../utils/surveyUtils'

interface SurveyLibraryViewProps {
  surveys: Survey[]
  onEdit: (survey: Survey) => void
  onDuplicate: (survey: Survey) => void
  onDelete: (survey: Survey) => void
  onExport: (survey: Survey) => void
  onPreview: (survey: Survey) => void
  onViewResults: (survey: Survey) => void
}

export const SurveyLibraryView: React.FC<SurveyLibraryViewProps> = ({
  surveys,
  onEdit,
  onDuplicate,
  onDelete,
  onExport,
  onPreview,
  onViewResults
}) => {
  if (surveys.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No surveys found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create your first survey to get started
        </Typography>
      </Paper>
    )
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {surveys.map((survey) => (
          <Grid item xs={12} md={6} lg={4} key={survey.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                    {survey.title}
                  </Typography>
                  <Chip 
                    label={`${getTotalQuestions(survey)} questions`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {survey.description || 'No description provided'}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Created: {formatDate(survey.createdAt)}
                  </Typography>
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    Updated: {formatDate(survey.updatedAt)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {survey.sections.slice(0, 3).map((section) => (
                    <Chip
                      key={section.id}
                      label={`${section.title} (${section.questions.length})`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  ))}
                  {survey.sections.length > 3 && (
                    <Chip
                      label={`+${survey.sections.length - 3} more sections`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
              </CardContent>
              
              <Divider />
              
              <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Preview Survey">
                    <IconButton
                      size="small"
                      color="default"
                      onClick={() => onPreview(survey)}
                    >
                      <PreviewIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="View Results">
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => onViewResults(survey)}
                    >
                      <BarChartIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Edit Survey">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onEdit(survey)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Duplicate Survey">
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => onDuplicate(survey)}
                    >
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Export Survey">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => onExport(survey)}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Tooltip title="Delete Survey">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(survey)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
} 