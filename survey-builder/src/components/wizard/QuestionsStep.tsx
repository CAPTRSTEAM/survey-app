import React, { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Grid,
  Paper,
  Button,
  IconButton,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  TextFields as TextIcon,
  RadioButtonChecked as RadioIcon,
  CheckBox as CheckboxIcon,
  Star as RatingIcon,
  ThumbUp as LikertIcon,
  ToggleOn as YesNoIcon,
  Reorder as RankingIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon
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
  const [showAddSection, setShowAddSection] = useState<boolean>(false)
  const [addingQuestionToSection, setAddingQuestionToSection] = useState<Set<number>>(new Set())
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]))

  const sections = data.sections || survey.sections || []

  // Helper function to get question type icon
  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <TextIcon />
      case 'radio': return <RadioIcon />
      case 'checkbox': return <CheckboxIcon />
      case 'rating': return <RatingIcon />
      case 'likert': return <LikertIcon />
      case 'yesno': return <YesNoIcon />
      case 'ranking': return <RankingIcon />
      default: return <TextIcon />
    }
  }

  // Question types for visual picker
  const questionTypes = [
    { value: 'text', label: 'Text Input', icon: <TextIcon />, desc: 'Free text response' },
    { value: 'radio', label: 'Multiple Choice', icon: <RadioIcon />, desc: 'Single selection' },
    { value: 'checkbox', label: 'Checkboxes', icon: <CheckboxIcon />, desc: 'Multiple selection' },
    { value: 'rating', label: 'Rating Scale', icon: <RatingIcon />, desc: '1-5 scale' },
    { value: 'likert', label: 'Likert Scale', icon: <LikertIcon />, desc: 'Agreement levels' },
    { value: 'yesno', label: 'Yes/No', icon: <YesNoIcon />, desc: 'Binary choice' },
    { value: 'ranking', label: 'Ranking', icon: <RankingIcon />, desc: 'Drag to reorder' }
  ]

  const toggleSectionExpansion = (sectionIndex: number) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionIndex)) {
      newExpanded.delete(sectionIndex)
    } else {
      newExpanded.add(sectionIndex)
    }
    setExpandedSections(newExpanded)
  }

  // Section reordering handlers
  const handleMoveSectionUp = (sectionIndex: number) => {
    if (sectionIndex <= 0) return
    
    const reorderedSections = [...sections]
    const currentSection = reorderedSections[sectionIndex]
    reorderedSections[sectionIndex] = reorderedSections[sectionIndex - 1]
    reorderedSections[sectionIndex - 1] = currentSection
    
    // Update order property for all sections
    const updatedSections = reorderedSections.map((section, index) => ({
      ...section,
      order: index + 1
    }))
    
    onChange({ sections: updatedSections })
  }

  const handleMoveSectionDown = (sectionIndex: number) => {
    if (sectionIndex >= sections.length - 1) return
    
    const reorderedSections = [...sections]
    const currentSection = reorderedSections[sectionIndex]
    reorderedSections[sectionIndex] = reorderedSections[sectionIndex + 1]
    reorderedSections[sectionIndex + 1] = currentSection
    
    // Update order property for all sections
    const updatedSections = reorderedSections.map((section, index) => ({
      ...section,
      order: index + 1
    }))
    
    onChange({ sections: updatedSections })
  }

  const handleAddSection = () => {
    if (!newSection.title.trim()) return

    const updatedSections = [...sections, { ...newSection, order: sections.length + 1 }]
    onChange({ sections: updatedSections })
    setNewSection(createNewSection())
    setShowAddSection(false)
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
    
    // Remove this section from the adding set
    const newAddingSet = new Set(addingQuestionToSection)
    newAddingSet.delete(sectionIndex)
    setAddingQuestionToSection(newAddingSet)
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
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Organize your survey into sections and add questions. Each section can have its own theme and multiple questions.
      </Typography>

      {/* Sections Overview */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
            Sections ({sections.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowAddSection(true)}
            sx={{ 
              backgroundColor: 'primary.main',
              '&:hover': { backgroundColor: 'primary.dark' }
            }}
          >
            Add Section
          </Button>
        </Box>

        {/* Add New Section Form */}
        {showAddSection && (
          <Paper sx={{ p: 3, mb: 3, border: '2px solid', borderColor: 'primary.light', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: 'primary.main' }}>Create New Section</Typography>
              <Button variant="outlined" size="small" onClick={() => { setShowAddSection(false); setNewSection(createNewSection()) }}>
                Cancel
              </Button>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Section Title"
                  value={newSection.title}
                  onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                  placeholder="e.g., Personal Information, Feedback Questions"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Section Description (Optional)"
                  value={newSection.description}
                  onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                  placeholder="Brief description of this section"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddSection}
                  disabled={!newSection.title.trim()}
                  sx={{ backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'primary.dark' } }}
                >
                  Create Section
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>

      {/* Sections as Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {sections.map((section: Section, sectionIndex: number) => (
          <Paper 
            key={section.id} 
            sx={{ 
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
              boxShadow: 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(24, 26, 67, 0.1)'
              }
            }}
          >
            {/* Section Header */}
            <Box sx={{ 
              p: 3, 
              backgroundColor: 'grey.50',
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
                  {/* Move Up/Down Arrows */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleMoveSectionUp(sectionIndex)}
                      disabled={sectionIndex === 0}
                      sx={{ 
                        backgroundColor: 'background.paper',
                        padding: '2px',
                        '&:hover': { backgroundColor: 'action.hover' },
                        '&:disabled': { opacity: 0.3 }
                      }}
                    >
                      <ArrowUpIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleMoveSectionDown(sectionIndex)}
                      disabled={sectionIndex === sections.length - 1}
                      sx={{ 
                        backgroundColor: 'background.paper',
                        padding: '2px',
                        '&:hover': { backgroundColor: 'action.hover' },
                        '&:disabled': { opacity: 0.3 }
                      }}
                    >
                      <ArrowDownIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, mb: 1 }}>
                      {section.title}
                    </Typography>
                    {section.description && (
                      <Typography variant="body2" color="text.secondary">
                        {section.description}
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 2 }}>
                  <Chip 
                    label={`${section.questions.length} questions`} 
                    size="small" 
                    sx={{ 
                      backgroundColor: 'primary.main', 
                      color: 'primary.contrastText',
                      fontWeight: 500
                    }} 
                  />

                  <IconButton
                    size="small"
                    onClick={() => toggleSectionExpansion(sectionIndex)}
                    sx={{ 
                      backgroundColor: 'background.paper',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    <ExpandMoreIcon 
                      sx={{ 
                        transform: expandedSections.has(sectionIndex) ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                      }} 
                    />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteSection(sectionIndex)}
                    disabled={sections.length === 1}
                    sx={{ 
                      backgroundColor: 'background.paper',
                      '&:hover': { backgroundColor: 'error.light', opacity: 0.1 }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            {/* Expanded Section Content */}
            {expandedSections.has(sectionIndex) && (
              <Box sx={{ p: 3 }}>
                {/* Section Settings */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                    Section Settings
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        fullWidth 
                        label="Section Title" 
                        value={section.title} 
                        onChange={(e) => handleUpdateSection(sectionIndex, 'title', e.target.value)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        fullWidth 
                        label="Section Description" 
                        value={section.description} 
                        onChange={(e) => handleUpdateSection(sectionIndex, 'description', e.target.value)} 
                        multiline 
                        rows={2}
                        variant="outlined"
                        placeholder="Optional description for this section"
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Questions Section */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      Questions ({section.questions.length})
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        const newAddingSet = new Set(addingQuestionToSection)
                        newAddingSet.add(sectionIndex)
                        setAddingQuestionToSection(newAddingSet)
                      }}
                      size="small"
                      sx={{ 
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '&:hover': { 
                          borderColor: 'primary.main',
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText'
                        }
                      }}
                    >
                      Add Question
                    </Button>
                  </Box>

                  {/* Add Question Form */}
                  {addingQuestionToSection.has(sectionIndex) && (
                    <Paper sx={{ p: 3, mb: 3, border: '2px solid', borderColor: 'primary.light', borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                        Add New Question
                      </Typography>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Question Text"
                            value={newQuestion.question}
                            onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                            placeholder="What would you like to ask?"
                            variant="outlined"
                          />
                        </Grid>

                        {/* Visual Question Type Picker */}
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                            Question Type
                          </Typography>
                          <Grid container spacing={1}>
                            {questionTypes.map((type) => (
                              <Grid item xs={6} sm={4} md={3} key={type.value}>
                                <Paper
                                  sx={{
                                    p: 2,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    border: newQuestion.type === type.value ? '2px solid' : '1px solid',
                                    borderColor: newQuestion.type === type.value ? 'primary.main' : 'divider',
                                    backgroundColor: newQuestion.type === type.value ? 'primary.light' : 'background.paper',
                                    '&:hover': {
                                      borderColor: 'primary.main',
                                      backgroundColor: 'primary.light'
                                    },
                                    transition: 'all 0.2s'
                                  }}
                                  onClick={() => setNewQuestion({
                                    ...newQuestion,
                                    type: type.value as any,
                                    options: getDefaultOptions(type.value)
                                  })}
                                >
                                  <Box sx={{ color: newQuestion.type === type.value ? 'primary.main' : 'text.secondary', mb: 1 }}>
                                    {type.icon}
                                  </Box>
                                  <Typography variant="caption" sx={{ 
                                    fontWeight: newQuestion.type === type.value ? 600 : 400,
                                    color: newQuestion.type === type.value ? 'primary.main' : 'text.primary',
                                    display: 'block',
                                    lineHeight: 1.2
                                  }}>
                                    {type.label}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                    {type.desc}
                                  </Typography>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={newQuestion.required}
                                onChange={(e) => setNewQuestion({ ...newQuestion, required: e.target.checked })}
                                sx={{
                                  '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: 'primary.main',
                                  },
                                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: 'primary.main',
                                  },
                                }}
                              />
                            }
                            label="Required Question"
                            sx={{ mt: 1 }}
                          />
                        </Grid>

                        {/* Options for choice-based questions */}
                        {(newQuestion.type === 'radio' || newQuestion.type === 'checkbox' || newQuestion.type === 'rating' || newQuestion.type === 'likert' || newQuestion.type === 'yesno' || newQuestion.type === 'ranking') && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                              Answer Options
                            </Typography>
                            {newQuestion.options?.map((option, optionIndex) => (
                              <Box key={optionIndex} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  value={option}
                                  onChange={(e) => handleOptionChange(newQuestion, optionIndex, e.target.value)}
                                  placeholder={`Option ${optionIndex + 1}`}
                                  variant="outlined"
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveOption(newQuestion, optionIndex)}
                                  color="error"
                                  sx={{ '&:hover': { backgroundColor: 'error.light', opacity: 0.1 } }}
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
                              sx={{ 
                                borderColor: 'primary.main',
                                color: 'primary.main',
                                '&:hover': { borderColor: 'primary.main', backgroundColor: 'primary.light' }
                              }}
                            >
                              Add Option
                            </Button>
                          </Grid>
                        )}

                        {/* Action Buttons */}
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button 
                              variant="outlined" 
                              onClick={() => {
                                const newAddingSet = new Set(addingQuestionToSection)
                                newAddingSet.delete(sectionIndex)
                                setAddingQuestionToSection(newAddingSet)
                                setNewQuestion(createNewQuestion())
                              }}
                              size="medium"
                            >
                              Cancel
                            </Button>
                            <Button 
                              variant="contained" 
                              startIcon={<AddIcon />} 
                              onClick={() => handleAddQuestion(sectionIndex)} 
                              disabled={!newQuestion.question.trim()}
                              sx={{ 
                                backgroundColor: 'primary.main',
                                '&:hover': { backgroundColor: 'primary.dark' }
                              }}
                            >
                              Add Question
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  )}

                  {/* Existing Questions List */}
                  {section.questions.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {section.questions.map((question: Question, questionIndex: number) => (
                        <Paper
                          key={question.id}
                          sx={{ 
                            p: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            '&:hover': { 
                              borderColor: 'primary.main',
                              boxShadow: 2
                            },
                            transition: 'all 0.2s'
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Box sx={{ color: 'primary.main' }}>
                                  {getQuestionTypeIcon(question.type)}
                                </Box>
                                <Typography variant="body1" sx={{ fontWeight: 500, color: 'primary.main' }}>
                                  Q{questionIndex + 1}. {question.question}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: 4 }}>
                                <Chip 
                                  label={getQuestionTypeLabel(question.type)} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ borderColor: 'primary.main', color: 'primary.main' }}
                                />
                                <Chip 
                                  label={question.required ? 'Required' : 'Optional'} 
                                  size="small" 
                                  color={question.required ? 'primary' : 'default'}
                                  sx={question.required ? { 
                                    backgroundColor: 'primary.main', 
                                    color: 'primary.contrastText' 
                                  } : {}}
                                />
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                              <IconButton 
                                size="small" 
                                onClick={() => handleEditQuestion(sectionIndex, questionIndex)}
                                sx={{ 
                                  color: 'primary.main',
                                  '&:hover': { backgroundColor: 'primary.light' }
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleDeleteQuestion(sectionIndex, questionIndex)}
                                sx={{ '&:hover': { backgroundColor: 'error.light', opacity: 0.1 } }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4, 
                      color: 'text.secondary',
                      border: '1px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      backgroundColor: 'background.paper'
                    }}>
                      <Typography variant="body2">
                        No questions yet. Click "Add Question" to get started.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Paper>
        ))}
      </Box>

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