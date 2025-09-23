import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  useTheme,
  LinearProgress,
  Container
} from '@mui/material'
import {
  Close as CloseIcon,
  Visibility as PreviewIcon,
  ArrowBack as BackIcon,
  ArrowForward as NextIcon
} from '@mui/icons-material'

import { Survey, Section, Question } from '../types/survey'

interface PreviewModeProps {
  survey: Survey
  open: boolean
  onClose: () => void
}

interface PreviewState {
  currentSectionIndex: number
  answers: Record<string, any>
  isCompleted: boolean
}

export const PreviewMode: React.FC<PreviewModeProps> = ({
  survey,
  open,
  onClose
}) => {
  const theme = useTheme()
  const [previewState, setPreviewState] = useState<PreviewState>({
    currentSectionIndex: -1, // Start at welcome screen
    answers: {},
    isCompleted: false
  })

  const handleStartSurvey = () => {
    setPreviewState(prev => ({ ...prev, currentSectionIndex: 0 }))
  }

  const handleNext = () => {
    if (previewState.currentSectionIndex < (survey.sections?.length || 0) - 1) {
      setPreviewState(prev => ({ ...prev, currentSectionIndex: prev.currentSectionIndex + 1 }))
    } else {
      setPreviewState(prev => ({ ...prev, isCompleted: true }))
    }
  }

  const handlePrevious = () => {
    if (previewState.currentSectionIndex > 0) {
      setPreviewState(prev => ({ ...prev, currentSectionIndex: prev.currentSectionIndex - 1 }))
    } else {
      setPreviewState(prev => ({ ...prev, currentSectionIndex: -1 }))
    }
  }

  const handleAnswerChange = (questionId: string, value: any) => {
    setPreviewState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: value }
    }))
  }

  const handleReset = () => {
    setPreviewState({
      currentSectionIndex: -1,
      answers: {},
      isCompleted: false
    })
  }

  const renderWelcomeScreen = () => (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        {survey.welcome?.title || 'Welcome to the Survey'}
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
        {survey.welcome?.message || 'Thank you for participating in this survey. Please click the button below to begin.'}
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={handleStartSurvey}
        sx={{
          px: 4,
          py: 1.5,
          backgroundColor: 'primary.main',
          '&:hover': {
            backgroundColor: 'primary.dark',
          }
        }}
      >
        Start Survey
      </Button>
    </Box>
  )

  const renderQuestion = (question: Question) => {
    const answer = previewState.answers[question.id]

    const handleInputChange = (value: any) => {
      handleAnswerChange(question.id, value)
    }

    switch (question.type) {
      case 'text':
        return (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'semibold', display: 'flex', alignItems: 'center', gap: 1 }}>
              {question.required && <span style={{ color: 'error.main', order: -1 }}>*</span>}
              {question.question}
            </Typography>
            <textarea
              value={answer || ''}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter your answer..."
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '12px',
                border: '2px solid',
                borderColor: 'divider',
                borderRadius: '8px',
                fontFamily: 'inherit',
                fontSize: '16px',
                resize: 'vertical'
              }}
            />
          </Box>
        )

      case 'radio':
        return (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'semibold', display: 'flex', alignItems: 'center', gap: 1 }}>
              {question.required && <span style={{ color: 'error.main', order: -1 }}>*</span>}
              {question.question}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontStyle: 'italic' }}>
              Select one option
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'row', 
              gap: 2, 
              flexWrap: 'wrap',
              width: '100%',
              justifyContent: 'space-between'
            }}>
              {question.options?.map((option) => (
                <label key={option} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  padding: '8px 12px',
                  border: '2px solid',
                  borderColor: answer === option ? theme.palette.primary.main : theme.palette.divider,
                  borderRadius: '6px',
                  backgroundColor: answer === option ? theme.palette.action.selected : theme.palette.background.paper,
                  flex: 1,
                  minWidth: 0,
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={answer === option}
                    onChange={(e) => handleInputChange(e.target.value)}
                    style={{ flexShrink: 0 }}
                  />
                  <span style={{ 
                    flex: 1, 
                    textAlign: 'center', 
                    color: answer === option ? '#ffffff' : theme.palette.text.primary 
                  }}>{option}</span>
                </label>
              ))}
            </Box>
          </Box>
        )

      case 'checkbox':
        return (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'semibold', display: 'flex', alignItems: 'center', gap: 1 }}>
              {question.required && <span style={{ color: 'error.main', order: -1 }}>*</span>}
              {question.question}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontStyle: 'italic' }}>
              Select all that apply
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'row', 
              gap: 2, 
              flexWrap: 'wrap',
              width: '100%',
              justifyContent: 'space-between'
            }}>
              {question.options?.map((option) => (
                <label key={option} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  padding: '8px 12px',
                  border: '2px solid',
                  borderColor: Array.isArray(answer) && answer.includes(option) ? theme.palette.primary.main : theme.palette.divider,
                  borderRadius: '6px',
                  backgroundColor: Array.isArray(answer) && answer.includes(option) ? theme.palette.action.selected : theme.palette.background.paper,
                  flex: 1,
                  minWidth: 0,
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <input
                    type="checkbox"
                    value={option}
                    checked={Array.isArray(answer) && answer.includes(option)}
                    onChange={(e) => {
                      const currentAnswers = Array.isArray(answer) ? answer : []
                      if (e.target.checked) {
                        handleInputChange([...currentAnswers, option])
                      } else {
                        handleInputChange(currentAnswers.filter(a => a !== option))
                      }
                    }}
                    style={{ flexShrink: 0 }}
                  />
                  <span style={{ 
                    flex: 1, 
                    textAlign: 'center', 
                    color: answer === option ? '#ffffff' : theme.palette.text.primary 
                  }}>{option}</span>
                </label>
              ))}
            </Box>
          </Box>
        )

      case 'likert':
        return (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'semibold', display: 'flex', alignItems: 'center', gap: 1 }}>
              {question.required && <span style={{ color: 'error.main', order: -1 }}>*</span>}
              {question.question}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'row', 
              gap: 2, 
              flexWrap: 'wrap', 
              width: '100%', 
              justifyContent: 'space-between', 
              alignItems: 'stretch' 
            }}>
              {question.options?.map((option) => (
                <Box
                  key={option}
                  component="label"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    padding: '8px 12px',
                    border: '2px solid',
                    borderColor: answer === option ? 'primary.main' : 'divider',
                    borderRadius: '6px',
                    backgroundColor: answer === option ? 'action.selected' : 'background.paper',
                    flex: 1,
                    minWidth: 0,
                    justifyContent: 'center',
                    textAlign: 'center',
                    flexDirection: 'row',
                    gap: '8px'
                  }}
                >
                  <input
                    type="checkbox"
                    name={question.id}
                    value={option}
                    checked={answer === option}
                    onChange={(e) => handleInputChange(e.target.value)}
                    style={{ flexShrink: 0 }}
                  />
                  <span style={{ 
                    flex: 1, 
                    textAlign: 'center', 
                    color: answer === option ? '#ffffff' : theme.palette.text.primary 
                  }}>{option}</span>
                </Box>
              ))}
            </Box>
          </Box>
        )

      case 'rating':
        return (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'semibold', display: 'flex', alignItems: 'center', gap: 1 }}>
              {question.required && <span style={{ color: 'error.main', order: -1 }}>*</span>}
              {question.question}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: '0.5rem', // var(--space-2)
              marginTop: '1rem', // var(--space-4)
              alignItems: 'center'
            }}>
              {[1, 2, 3, 4, 5].map((rating) => {
                // A star should be highlighted if it's less than or equal to the selected rating
                const isHighlighted = answer && rating <= answer;
                return (
                  <Box
                    key={rating}
                    component="label"
                    sx={{
                      fontSize: '1.5rem', // var(--font-size-2xl) 
                      color: isHighlighted ? theme.palette.warning.main : theme.palette.grey[400],
                      cursor: 'pointer',
                      transition: 'color 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      '&:hover': {
                        color: theme.palette.warning.main
                      }
                    }}
                    onClick={() => handleInputChange(rating)}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={rating.toString()}
                      checked={answer === rating}
                      onChange={() => handleInputChange(rating)}
                      style={{
                        position: 'absolute',
                        opacity: 0,
                        pointerEvents: 'none'
                      }}
                    />
                    <span style={{ display: 'block' }}>★</span>
                  </Box>
                )
              })}
            </Box>
          </Box>
        )

      case 'yesno':
        return (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'semibold', display: 'flex', alignItems: 'center', gap: 1 }}>
              {question.required && <span style={{ color: 'error.main', order: -1 }}>*</span>}
              {question.question}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              width: '100%',
              justifyContent: 'space-between'
            }}>
              {['Yes', 'No'].map((option) => (
                <label key={option} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  padding: '8px 24px',
                  border: '2px solid',
                  borderColor: answer === option ? theme.palette.primary.main : theme.palette.divider,
                  borderRadius: '6px',
                  backgroundColor: answer === option ? theme.palette.action.selected : theme.palette.background.paper,
                  flex: 1,
                  minWidth: 0,
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={answer === option}
                    onChange={(e) => handleInputChange(e.target.value)}
                    style={{ flexShrink: 0 }}
                  />
                  <span style={{ 
                    flex: 1, 
                    textAlign: 'center', 
                    color: answer === option ? '#ffffff' : theme.palette.text.primary 
                  }}>{option}</span>
                </label>
              ))}
            </Box>
          </Box>
        )

            case 'ranking':
        const RankingComponent = () => {
          const [draggedOption, setDraggedOption] = React.useState<string | null>(null);

          const handleDragStart = (e: React.DragEvent<HTMLDivElement>, option: string) => {
            setDraggedOption(option);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', option);
            
            // Add visual feedback
            const target = e.currentTarget as HTMLElement;
            target.style.opacity = '0.5';
            target.style.transform = 'rotate(2deg)';
          };

          const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
            setDraggedOption(null);
            
            // Remove visual feedback
            const target = e.currentTarget as HTMLElement;
            target.style.opacity = '';
            target.style.transform = '';
            
            // Remove drag-over styling from all items
            const allItems = document.querySelectorAll('.ranking-item-preview');
            allItems.forEach(item => {
              item.classList.remove('drag-over');
            });
          };

          const handleDragOver = (e: React.DragEvent<HTMLDivElement>, option: string) => {
            if (!draggedOption || draggedOption === option) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            // Add visual feedback
            const target = e.currentTarget as HTMLElement;
            target.classList.add('drag-over');
          };

          const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
            const target = e.currentTarget as HTMLElement;
            target.classList.remove('drag-over');
          };

          const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropTarget: string) => {
            if (!draggedOption || draggedOption === dropTarget) return;
            e.preventDefault();
            
            // Remove drag-over styling
            const target = e.currentTarget as HTMLElement;
            target.classList.remove('drag-over');
            
            // Get current rankings
            const currentRankings = (answer ? { ...answer } : {}) as Record<string, number>;
            const draggedRank = currentRankings[draggedOption];
            const targetRank = currentRankings[dropTarget];
            
            if (draggedRank && targetRank) {
              // Swap rankings
              currentRankings[draggedOption] = targetRank;
              currentRankings[dropTarget] = draggedRank;
            } else if (draggedRank && !targetRank) {
              // Move dragged item to unranked position
              delete currentRankings[draggedOption];
              currentRankings[dropTarget] = draggedRank;
            } else if (!draggedRank && targetRank) {
              // Move unranked item to ranked position
              currentRankings[draggedOption] = targetRank;
              delete currentRankings[dropTarget];
            } else {
              // Both unranked - assign next available rank to dragged item
              const nextRank = getNextAvailableRank(currentRankings, question.options?.length || 0);
              currentRankings[draggedOption] = nextRank;
            }
            
            handleInputChange(currentRankings);
          };

          const getNextAvailableRank = (rankings: Record<string, number>, totalOptions: number): number => {
            const ranks = Object.values(rankings);
            if (ranks.length === 0) return 1;
            
            // Find the next available rank within the valid range
            for (let rank = 1; rank <= totalOptions; rank++) {
              if (!ranks.includes(rank)) {
                return rank;
              }
            }
            
            return 0; // Shouldn't happen in normal usage
          };

          return (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'semibold', display: 'flex', alignItems: 'center', gap: 1 }}>
                {question.required && <span style={{ color: 'error.main', order: -1 }}>*</span>}
                {question.question}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                Drag and drop options to rank them, or click to toggle ranking. Higher ranked items appear at the top.
              </Typography>
              
              {/* Show completion status */}
              <Box sx={{ 
                mb: 2, 
                p: 2, 
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: Object.keys(answer || {}).length === question.options?.length ? theme.palette.success.light : theme.palette.warning.light,
                color: Object.keys(answer || {}).length === question.options?.length ? theme.palette.success.dark : theme.palette.warning.dark,
                border: Object.keys(answer || {}).length === question.options?.length ? `1px solid ${theme.palette.success.main}` : `1px solid ${theme.palette.warning.main}`
              }}>
                {Object.keys(answer || {}).length === question.options?.length 
                  ? `All ${question.options?.length} options ranked`
                  : `${Object.keys(answer || {}).length} of ${question.options?.length} options ranked`
                }
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {question.options?.sort((a, b) => {
                  const rankA = answer?.[a] || 0;
                  const rankB = answer?.[b] || 0;
                  if (rankA === 0 && rankB === 0) return 0;
                  if (rankA === 0) return 1;
                  if (rankB === 0) return -1;
                  return rankA - rankB;
                }).map((option) => {
                  const isRanked = answer?.[option] > 0;
                  const rankNumber = answer?.[option] || 0;
                  const totalRanked = Object.keys(answer || {}).length;
                  
                  return (
                    <Box
                      key={option}
                      className="ranking-item-preview"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        padding: '12px 16px',
                        border: '2px solid',
                        borderColor: isRanked ? theme.palette.primary.main : theme.palette.divider,
                        borderRadius: '8px',
                        backgroundColor: isRanked ? theme.palette.action.selected : theme.palette.background.paper,
                        cursor: 'grab',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          backgroundColor: theme.palette.action.hover,
                          transform: 'translateY(-1px)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        },
                        '&:active': {
                          cursor: 'grabbing'
                        },
                        '&.drag-over': {
                          borderColor: theme.palette.primary.main,
                          backgroundColor: theme.palette.action.selected,
                          transform: 'scale(1.02)',
                          boxShadow: '0 4px 8px rgba(67, 88, 163, 0.3)'
                        }
                      }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, option)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, option)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, option)}
                      onClick={() => {
                        const currentRankings = answer || {}
                        if (currentRankings[option]) {
                          const newRankings = { ...currentRankings }
                          delete newRankings[option]
                          handleInputChange(newRankings)
                        } else {
                          const nextRank = Object.keys(currentRankings).length + 1
                          handleInputChange({ ...currentRankings, [option]: nextRank })
                        }
                      }}
                    >
                      {/* Drag handle */}
                      <Box sx={{ 
                        color: theme.palette.grey[400], 
                        fontSize: '18px', 
                        cursor: 'grab', 
                        userSelect: 'none', 
                        flexShrink: 0,
                        width: '16px',
                        textAlign: 'center',
                        '&:active': { cursor: 'grabbing' }
                      }}>
                        ⋮⋮
                      </Box>

                      {/* Ranking circle */}
                      <Box sx={{
                        width: '32px',
                        height: '32px',
                        border: '2px solid',
                        borderColor: isRanked ? theme.palette.primary.main : theme.palette.divider,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        backgroundColor: isRanked ? theme.palette.primary.main : theme.palette.background.paper,
                        color: isRanked ? theme.palette.primary.contrastText : theme.palette.text.secondary
                      }}>
                        {isRanked ? rankNumber : ''}
                      </Box>

                      {/* Option text */}
                      <span style={{ 
                        flex: 1, 
                        fontWeight: '500',
                        color: isRanked ? '#ffffff' : theme.palette.text.primary
                      }}>{option}</span>

                      {/* Action buttons */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                        {/* Up arrow */}
                        {isRanked && rankNumber > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newAnswer = { ...answer };
                              const optionAbove = Object.keys(newAnswer).find(key => newAnswer[key] === rankNumber - 1);
                              if (optionAbove) {
                                newAnswer[option] = rankNumber - 1;
                                newAnswer[optionAbove] = rankNumber;
                                handleInputChange(newAnswer);
                              }
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: theme.palette.success.main,
                              fontSize: '16px',
                              cursor: 'pointer',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              transition: 'all 0.2s',
                              minWidth: '24px',
                              minHeight: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = theme.palette.success.light;
                              e.currentTarget.style.color = theme.palette.success.dark;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = theme.palette.success.main;
                            }}
                          >
                            ↑
                          </button>
                        )}

                        {/* Down arrow */}
                        {isRanked && rankNumber < totalRanked && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newAnswer = { ...answer };
                              const optionBelow = Object.keys(newAnswer).find(key => newAnswer[key] === rankNumber + 1);
                              if (optionBelow) {
                                newAnswer[option] = rankNumber + 1;
                                newAnswer[optionBelow] = rankNumber;
                                handleInputChange(newAnswer);
                              }
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: theme.palette.warning.main,
                              fontSize: '16px',
                              cursor: 'pointer',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              transition: 'all 0.2s',
                              minWidth: '24px',
                              minHeight: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = theme.palette.warning.light;
                              e.currentTarget.style.color = theme.palette.warning.dark;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = theme.palette.warning.main;
                            }}
                          >
                            ↓
                          </button>
                        )}

                        {/* Remove button */}
                        {isRanked && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newAnswer = { ...answer };
                              delete newAnswer[option];
                              handleInputChange(newAnswer);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: theme.palette.text.secondary,
                              fontSize: '18px',
                              cursor: 'pointer',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              transition: 'all 0.2s',
                              minWidth: '24px',
                              minHeight: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = theme.palette.error.light;
                              e.currentTarget.style.color = theme.palette.error.dark;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = theme.palette.text.secondary;
                            }}
                          >
                            ×
                          </button>
                        )}
                      </Box>
                    </Box>
                  )
                })}
              </Box>
            </Box>
          );
        };

        return React.createElement(RankingComponent);

      default:
        return (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'semibold', display: 'flex', alignItems: 'center', gap: 1 }}>
              {question.required && <span style={{ color: 'error.main', order: -1 }}>*</span>}
              {question.question}
            </Typography>
            <Typography variant="body2" sx={{ color: 'error.main' }}>
              Question type "{question.type}" is not supported in preview mode.
            </Typography>
          </Box>
        )
    }
  }

  const renderSection = (section: Section, index: number) => (
    <Box key={section.id} sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        {index + 1}. {section.title}
      </Typography>
      {section.description && (
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          {section.description}
        </Typography>
      )}
             {section.questions.map((question) => (
        <Paper key={question.id} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
          {renderQuestion(question)}
        </Paper>
      ))}
    </Box>
  )

  const renderThankYouScreen = () => (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        {survey.thankYou?.title || 'Thank You!'}
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
        {survey.thankYou?.message || 'Thank you for completing this survey. Your responses have been recorded.'}
      </Typography>
      <Button
        variant="outlined"
        onClick={handleReset}
        sx={{ borderColor: 'primary.main', color: 'primary.main' }}
      >
        Preview Again
      </Button>
    </Box>
  )

  const renderProgressBar = () => {
    if (previewState.currentSectionIndex === -1 || previewState.isCompleted) return null
    
    const totalSections = survey.sections?.length || 0
    const currentSection = previewState.currentSectionIndex + 1
    const progress = (currentSection / totalSections) * 100

    return (
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Question {currentSection} of {totalSections}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(progress)}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>
    )
  }

  const renderNavigation = () => {
    if (previewState.currentSectionIndex === -1 || previewState.isCompleted) return null

         const canGoBack = previewState.currentSectionIndex > 0
     const isLastSection = previewState.currentSectionIndex === (survey.sections?.length || 0) - 1

    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mt: 4,
        pt: 3,
        borderTop: '1px solid',
        borderColor: 'divider'
      }}>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={handlePrevious}
          disabled={!canGoBack}
          sx={{ borderColor: 'primary.main', color: 'primary.main' }}
        >
          {previewState.currentSectionIndex === 0 ? 'Back to Welcome' : 'Previous'}
        </Button>
        
        <Button
          variant="contained"
          endIcon={isLastSection ? undefined : <NextIcon />}
          onClick={handleNext}
          sx={{
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
            }
          }}
        >
          {isLastSection ? 'Complete Survey' : 'Next'}
        </Button>
      </Box>
    )
  }

  const renderContent = () => {
    if (previewState.currentSectionIndex === -1) {
      return renderWelcomeScreen()
    }
    
    if (previewState.isCompleted) {
      return renderThankYouScreen()
    }

    const currentSection = survey.sections?.[previewState.currentSectionIndex]
    if (!currentSection) return null

    return (
      <Box>
        {renderProgressBar()}
        {renderSection(currentSection, previewState.currentSectionIndex)}
        {renderNavigation()}
      </Box>
    )
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
          borderRadius: 3
        }
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 2, 
        backgroundColor: 'primary.main',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PreviewIcon />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Survey Preview
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ color: 'text.primary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        <Container maxWidth="md" sx={{ py: 4, height: '100%', overflow: 'auto' }}>
          {renderContent()}
        </Container>
      </DialogContent>
    </Dialog>
  )
}
