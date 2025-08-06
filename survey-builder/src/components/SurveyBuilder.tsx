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
  Add as AddIcon,
  LibraryBooks as LibraryIcon
} from '@mui/icons-material'

import { Survey } from '../types/survey'
import { useSurveyContext } from '../context/SurveyContext'
import { exportSurvey } from '../utils/surveyUtils'
import { SurveyLibraryView } from './SurveyLibraryView'
import { SurveyWizard } from './SurveyWizard'

const SurveyBuilder: React.FC = () => {
  const { surveys, loading, deleteSurvey, duplicateSurvey } = useSurveyContext()
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
  const [view, setView] = useState<'library' | 'wizard'>('library')
  const [refreshKey, setRefreshKey] = useState(0)
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
      exportSurvey(survey)
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          Loading Survey Library...
        </Typography>
      </Container>
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LibraryIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
              Survey Builder
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Create, edit, and manage your surveys
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={handleCreateSurvey}
          sx={{ px: 3, py: 1.5 }}
        >
          Create New Survey
        </Button>
      </Box>

      {/* Survey Library */}
      <SurveyLibraryView
        key={`library-${surveys.length}-${refreshKey}`}
        surveys={surveys}
        onEdit={handleEditSurvey}
        onDuplicate={handleDuplicateSurvey}
        onDelete={handleDeleteSurvey}
        onExport={handleExportSurvey}
      />

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
    </Container>
  )
}

export default SurveyBuilder 