import React, { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Grid,
  Paper,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  Chip,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material'

import { Survey, Question, Section } from '../../types/survey'
import { createNewQuestion, getQuestionTypeLabel, getDefaultOptions, createNewSection } from '../../utils/surveyUtils'

interface QuestionsStepProps {
  data: any
  survey: Survey
  onChange: (data: any) => void
}

export const QuestionsStep: React.FC<QuestionsStepProps> = ({
  data,
  survey,
  onChange
}) => {
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number>(-1)
  const [editingSectionIndex, setEditingSectionIndex] = useState<number>(-1)
  const [newQuestion, setNewQuestion] = useState<Question>(createNewQuestion())
  const [newSection, setNewSection] = useState<Section>(createNewSection())

  const sections = data.sections || survey.sections || []

  const handleAddSection = () => {
    if (!newSection.title.trim()) return

    const updatedSections = [...sections, { ...newSection, order: sections.length + 1 }]
    onChange({ sections: updatedSections })
    setNewSection(createNewSection())
  }

  const handleDeleteSection = (sectionIndex: number) => {
    const updatedSections = sections.filter((_: Section, i: number) => i !== sectionIndex)
    onChange({ sections: updatedSections })
  }

  const handleUpdateSection = (sectionIndex: number, field: string, value: any) => {
    const updatedSections = [...sections]
    updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], [field]: value }
    onChange({ sections: updatedSections })
  }

  const handleAddQuestion = (sectionIndex: number) => {
    if (!newQuestion.question.trim()) return

    const updatedSections = [...sections]
    const section = updatedSections[sectionIndex]
    const updatedQuestions = [...section.questions, { ...newQuestion, order: section.questions.length + 1 }]
    updatedSections[sectionIndex] = { ...section, questions: updatedQuestions }
    
    onChange({ sections: updatedSections })
    setNewQuestion(createNewQuestion())
  }

  const handleEditQuestion = (sectionIndex: number, questionIndex: number) => {
    setEditingQuestion({ ...sections[sectionIndex].questions[questionIndex] })
    setEditingQuestionIndex(questionIndex)
    setEditingSectionIndex(sectionIndex)
  }

  const handleSaveQuestion = () => {
    if (!editingQuestion || editingQuestionIndex === -1 || editingSectionIndex === -1) return

    const updatedSections = [...sections]
    const section = updatedSections[editingSectionIndex]
    const updatedQuestions = [...section.questions]
    updatedQuestions[editingQuestionIndex] = editingQuestion
    updatedSections[editingSectionIndex] = { ...section, questions: updatedQuestions }
    
    onChange({ sections: updatedSections })
    
    setEditingQuestion(null)
    setEditingQuestionIndex(-1)
    setEditingSectionIndex(-1)
  }

  const handleCancelEdit = () => {
    setEditingQuestion(null)
    setEditingQuestionIndex(-1)
    setEditingSectionIndex(-1)
  }

  const handleDeleteQuestion = (sectionIndex: number, questionIndex: number) => {
    const updatedSections = [...sections]
    const section = updatedSections[sectionIndex]
    const updatedQuestions = section.questions.filter((_: Question, i: number) => i !== questionIndex)
    updatedSections[sectionIndex] = { ...section, questions: updatedQuestions }
    onChange({ sections: updatedSections })
  }

  const handleQuestionTypeChange = (question: Question, newType: string) => {
    const updatedQuestion = { ...question, type: newType as any }
    
    if (['radio', 'checkbox', 'rating', 'likert', 'ranking'].includes(newType)) {
      updatedQuestion.options = getDefaultOptions(newType)
    } else {
      updatedQuestion.options = []
    }
    
    if (editingQuestion) {
      setEditingQuestion(updatedQuestion)
    } else {
      setNewQuestion(updatedQuestion)
    }
  }

  const handleOptionChange = (question: Question, index: number, value: string) => {
    const updatedOptions = [...(question.options || [])]
    updatedOptions[index] = value
    const updatedQuestion = { ...question, options: updatedOptions }
    
    if (editingQuestion) {
      setEditingQuestion(updatedQuestion)
    } else {
      setNewQuestion(updatedQuestion)
    }
  }

  const handleAddOption = (question: Question) => {
    const updatedOptions = [...(question.options || []), '']
    const updatedQuestion = { ...question, options: updatedOptions }
    
    if (editingQuestion) {
      setEditingQuestion(updatedQuestion)
    } else {
      setNewQuestion(updatedQuestion)
    }
  }

  const handleRemoveOption = (question: Question, index: number) => {
    const updatedOptions = question.options?.filter((_, i) => i !== index) || []
    const updatedQuestion = { ...question, options: updatedOptions }
    
    if (editingQuestion) {
      setEditingQuestion(updatedQuestion)
    } else {
      setNewQuestion(updatedQuestion)
    }
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Survey Questions
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Add sections and questions for your survey. Each section can have its own title, description, and set of questions.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Question Types:</strong> Text Input (free text), Multiple Choice (single selection), 
        Checkboxes (multiple selection), Rating Scale (1-5), Likert Scale (agreement levels), 
        Yes/No (binary choice), Ranking (drag to reorder)
      </Alert>

      {/* Add New Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add New Section
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Section Title"
              value={newSection.title}
              onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
              placeholder="Enter section title"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Section Description"
              value={newSection.description}
              onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
              placeholder="Enter section description"
              multiline
              rows={3}
              minRows={2}
              maxRows={6}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddSection}
              disabled={!newSection.title.trim()}
            >
              Add Section
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Existing Sections */}
      {sections.map((section: Section, sectionIndex: number) => (
        <Accordion key={section.id} defaultExpanded={sectionIndex === 0} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Typography variant="h6">{section.title} ({section.questions.length} questions)</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {/* Section Header with Delete Button (moved here to fix nesting) */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Section Details</Typography>
              <IconButton color="error" onClick={() => handleDeleteSection(sectionIndex)} disabled={sections.length === 1} size="small"><DeleteIcon /></IconButton>
            </Box>
            {/* Section Details (title, description inputs) */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}><TextField fullWidth label="Section Title" value={section.title} onChange={(e) => handleUpdateSection(sectionIndex, 'title', e.target.value)} /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth label="Section Description" value={section.description} onChange={(e) => handleUpdateSection(sectionIndex, 'description', e.target.value)} multiline rows={3} minRows={2} maxRows={6} /></Grid>
            </Grid>

            {/* Add New Question (within section) */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Add New Question to {section.title}</Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Question"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    placeholder="Enter your question here"
                  />
                </Grid>
                <Grid item xs={12} sx={{ mb: 2 }}>
                  {/* Spacer for better visual separation */}
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Question Type"
                    value={newQuestion.type}
                    onChange={(e) => {
                      const newType = e.target.value as string
                      setNewQuestion({
                        ...newQuestion,
                        type: newType as any,
                        options: getDefaultOptions(newType)
                      })
                    }}
                    select
                  >
                    <MenuItem value="text">Text Input</MenuItem>
                    <MenuItem value="radio">Multiple Choice</MenuItem>
                    <MenuItem value="checkbox">Checkboxes</MenuItem>
                    <MenuItem value="rating">Rating Scale</MenuItem>
                    <MenuItem value="likert">Likert Scale</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newQuestion.required}
                        onChange={(e) => setNewQuestion({ ...newQuestion, required: e.target.checked })}
                      />
                    }
                    label="Required"
                  />
                </Grid>
                {(newQuestion.type === 'radio' || newQuestion.type === 'checkbox' || newQuestion.type === 'rating' || newQuestion.type === 'likert' || newQuestion.type === 'ranking') && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>Options</Typography>
                    {newQuestion.options?.map((option, optionIndex) => (
                      <Box key={optionIndex} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={option}
                          onChange={(e) => handleOptionChange(newQuestion, optionIndex, e.target.value)}
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveOption(newQuestion, optionIndex)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => handleAddOption(newQuestion)}
                    >
                      Add Option
                    </Button>
                  </Grid>
                )}
              </Grid>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleAddQuestion(sectionIndex)} disabled={!newQuestion.question.trim()}>Add Question</Button>
            </Paper>

            {/* Existing Questions (within section) */}
            {section.questions.length > 0 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Questions in {section.title} ({section.questions.length})</Typography>
                <List>
                  {section.questions.map((question: Question, questionIndex: number) => (
                    <React.Fragment key={question.id}>
                      <ListItem>
                        {/* Restructured ListItem content to avoid div in p error */}
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="body1" sx={{ flexGrow: 1 }}>{questionIndex + 1}. {question.question}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                              <IconButton color="primary" size="small" onClick={() => handleEditQuestion(sectionIndex, questionIndex)}><EditIcon /></IconButton>
                              <IconButton color="error" size="small" onClick={() => handleDeleteQuestion(sectionIndex, questionIndex)}><DeleteIcon /></IconButton>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip label={getQuestionTypeLabel(question.type)} size="small" variant="outlined" />
                            <Chip label={question.required ? 'Required' : 'Optional'} size="small" color={question.required ? 'primary' : 'default'} />
                          </Box>
                        </Box>
                      </ListItem>
                      {questionIndex < section.questions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Edit Question Dialog */}
      {editingQuestion && (
        <Paper sx={{ p: 3, mt: 3, border: '2px solid', borderColor: 'primary.main' }}>
          <Typography variant="h6" gutterBottom>
            Edit Question
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Question Text"
                value={editingQuestion.question}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
              />
            </Grid>
            
                         <Grid item xs={12} md={6}>
               <TextField
                 fullWidth
                 label="Question Type"
                 value={editingQuestion.type}
                 onChange={(e) => handleQuestionTypeChange(editingQuestion, e.target.value)}
                 select
               >
                 <MenuItem value="text">Text Input</MenuItem>
                 <MenuItem value="radio">Multiple Choice</MenuItem>
                 <MenuItem value="checkbox">Checkboxes</MenuItem>
                 <MenuItem value="rating">Rating Scale</MenuItem>
                 <MenuItem value="likert">Likert Scale</MenuItem>
                 <MenuItem value="yesno">Yes/No</MenuItem>
                 <MenuItem value="ranking">Ranking</MenuItem>
               </TextField>
             </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editingQuestion.required}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, required: e.target.checked })}
                  />
                }
                label="Required Question"
              />
            </Grid>
            
            {/* Options for choice-based questions */}
            {['radio', 'checkbox', 'rating', 'likert', 'ranking'].includes(editingQuestion.type) && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Options
                </Typography>
                {editingQuestion.options?.map((option, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      size="small"
                      value={option}
                      onChange={(e) => handleOptionChange(editingQuestion, index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      sx={{ flexGrow: 1 }}
                    />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveOption(editingQuestion, index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddOption(editingQuestion)}
                >
                  Add Option
                </Button>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveQuestion}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  )
} 