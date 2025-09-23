import React, { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  LinearProgress
} from '@mui/material'
import {
  Add as AddIcon
} from '@mui/icons-material'

import { Survey } from '../types/survey'
import { useSurveyContext } from '../context/SurveyContext'
import { exportSurveyWithSections } from '../utils/surveyUtils'
import { SurveyLibraryView } from './SurveyLibraryView'
import { SurveyWizard } from './SurveyWizard'
import { PreviewMode } from './PreviewMode'

const SurveyBuilder: React.FC = () => {
  const { surveys, loading, deleteSurvey, duplicateSurvey } = useSurveyContext()
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
  const [view, setView] = useState<'library' | 'wizard'>('library')
  const [refreshKey, setRefreshKey] = useState(0)
  const [previewSurvey, setPreviewSurvey] = useState<Survey | null>(null)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'info' | 'warning'
  }>({ open: false, message: '', severity: 'success' })
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    survey: Survey | null
  }>({ open: false, survey: null })

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const hideSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  const handleCreateSurvey = () => {
    setSelectedSurvey(null)
    setView('wizard')
  }

  const handleEditSurvey = (survey: Survey) => {
    setSelectedSurvey(survey)
    setView('wizard')
  }

  const handleDuplicateSurvey = (survey: Survey) => {
    duplicateSurvey(survey)
    showSnackbar('Survey duplicated successfully')
  }

  const handlePreviewSurvey = (survey: Survey) => {
    setPreviewSurvey(survey)
  }

  const handleDeleteSurvey = (survey: Survey) => {
    setDeleteDialog({ open: true, survey })
  }

  const confirmDeleteSurvey = () => {
    if (deleteDialog.survey) {
      deleteSurvey(deleteDialog.survey.id)
      showSnackbar('Survey deleted successfully')
      setDeleteDialog({ open: false, survey: null })
    }
  }

  const handleExportSurvey = (survey: Survey) => {
    try {
      exportSurveyWithSections(survey)
      showSnackbar('Survey exported successfully')
    } catch (error) {
      showSnackbar('Failed to export survey', 'error')
    }
  }

  const handleWizardComplete = () => {
    setView('library')
    setRefreshKey(prev => prev + 1) // Force re-render
    showSnackbar('Survey saved successfully')
  }

  const handleWizardCancel = () => {
    setView('library')
    setSelectedSurvey(null)
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        {/* 3/4 Width Header Bar */}
        <Box sx={{ 
          backgroundColor: 'primary.dark',
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
          {/* CAPTRS Logo */}
          <Box
            component="img"
            src="./CAPTRS_StackedLogo_White_Square-01-01.png"
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
            CAPTRS Survey Builder
          </Typography>
        </Box>
        </Box>

        {/* Main Content with top padding for fixed header */}
        <Container maxWidth="lg" sx={{ py: 4, pt: 12 }}>
          <LinearProgress />
          <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
            Loading Survey Library...
          </Typography>
        </Container>
      </Box>
    )
  }

  if (view === 'wizard') {
    return (
      <SurveyWizard
        survey={selectedSurvey}
        onComplete={handleWizardComplete}
        onCancel={handleWizardCancel}
      />
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* 3/4 Width Header Bar */}
      <Box sx={{ 
        backgroundColor: 'primary.dark',
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
          {/* CAPTRS Logo */}
          <Box
            component="img"
            src="./CAPTRS_StackedLogo_White_Square-01-01.png"
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
            CAPTRS Survey Builder
          </Typography>
        </Box>

      </Box>

      {/* Main Content with top padding for fixed header */}
      <Container maxWidth="lg" sx={{ py: 4, pt: 16, display: 'flex', justifyContent: 'center' }}>
        {/* Survey Library Box - Centered */}
        <Box sx={{ 
          backgroundColor: 'background.paper',
          borderRadius: 3,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          border: '1px solid',
          borderColor: 'divider',
          p: 4,
          position: 'relative',
          width: '100%',
          maxWidth: 1200
        }}>
          {/* Library Header with Create Button */}
          <Box sx={{ 
            mb: 4,
            pb: 3,
            borderBottom: '2px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold',
                fontFamily: '"DM Sans", sans-serif',
                color: 'primary.main',
                mb: 1
              }}>
                Survey Library
              </Typography>
              <Typography variant="body1" sx={{ 
                color: 'text.secondary',
                fontFamily: '"Open Sans", sans-serif',
                fontWeight: 400
              }}>
                {surveys.length} survey{surveys.length !== 1 ? 's' : ''} available
              </Typography>
            </Box>
            
            {/* Create Survey Button - Inline with title */}
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleCreateSurvey}
              sx={{ 
                px: 3, 
                py: 1.5,
                backgroundColor: 'primary.main',
                color: 'white',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(43, 61, 139, 0.2)',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  boxShadow: '0 4px 12px rgba(43, 61, 139, 0.3)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out',
                ml: 3
              }}
            >
              Create New Survey
            </Button>
          </Box>

          {/* Survey Library Content */}
          <SurveyLibraryView
            key={`library-${surveys.length}-${refreshKey}`}
            surveys={surveys}
            onEdit={handleEditSurvey}
            onDuplicate={handleDuplicateSurvey}
            onDelete={handleDeleteSurvey}
            onExport={handleExportSurvey}
            onPreview={handlePreviewSurvey}
          />
        </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, survey: null })}>
        <DialogTitle>Delete Survey</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.survey?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, survey: null })}>
            Cancel
          </Button>
          <Button onClick={confirmDeleteSurvey} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={hideSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Preview Mode */}
      {previewSurvey && (
        <PreviewMode
          survey={previewSurvey}
          open={!!previewSurvey}
          onClose={() => setPreviewSurvey(null)}
        />
      )}
    </Container>
  </Box>
  )
}

export default SurveyBuilder 