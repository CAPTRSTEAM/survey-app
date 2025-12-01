import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material'
import { QuestionStatistics, Survey, SurveyResponse } from '../types/survey'
import { getQuestionTypeLabel } from '../utils/surveyUtils'

interface QuestionAnalyticsProps {
  questionStat: QuestionStatistics
  survey: Survey
  responses: SurveyResponse[]
}

export const QuestionAnalytics: React.FC<QuestionAnalyticsProps> = ({
  questionStat,
  survey,
  responses
}) => {
  // Find the question in the survey
  const question = survey.sections
    .flatMap(s => s.questions)
    .find(q => q.id === questionStat.questionId)

  if (!question) return null

  const responseRate = questionStat.responseRate
  const totalPossible = responses.length

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            {questionStat.questionText}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <Chip
              label={getQuestionTypeLabel(questionStat.questionType)}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`${questionStat.totalResponses} / ${totalPossible} responses`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`${responseRate.toFixed(1)}% response rate`}
              size="small"
              variant="outlined"
            />
            {questionStat.averageRating !== undefined && (
              <Chip
                label={`Avg: ${questionStat.averageRating.toFixed(2)}`}
                size="small"
                color="secondary"
                variant="outlined"
              />
            )}
          </Box>
          <LinearProgress
            variant="determinate"
            value={responseRate}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Choice-based questions (radio, checkbox, yesno) */}
        {questionStat.optionCounts && Object.keys(questionStat.optionCounts).length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              Response Distribution
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Option</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Percentage</TableCell>
                    <TableCell>Visual</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(questionStat.optionCounts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([option, count]) => {
                      const percentage = questionStat.totalResponses > 0
                        ? (count / questionStat.totalResponses) * 100
                        : 0
                      return (
                        <TableRow key={option}>
                          <TableCell>{option}</TableCell>
                          <TableCell align="right">{count}</TableCell>
                          <TableCell align="right">{percentage.toFixed(1)}%</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={percentage}
                                sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Rating/Likert distribution */}
        {questionStat.ratingDistribution && Object.keys(questionStat.ratingDistribution).length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              Rating Distribution
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Rating</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Percentage</TableCell>
                    <TableCell>Visual</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(questionStat.ratingDistribution)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([rating, count]) => {
                      const percentage = questionStat.totalResponses > 0
                        ? (count / questionStat.totalResponses) * 100
                        : 0
                      return (
                        <TableRow key={rating}>
                          <TableCell>
                            {question.options && question.options[parseInt(rating) - 1]
                              ? question.options[parseInt(rating) - 1]
                              : rating}
                          </TableCell>
                          <TableCell align="right">{count}</TableCell>
                          <TableCell align="right">{percentage.toFixed(1)}%</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={percentage}
                                sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Text responses */}
        {questionStat.textResponses && questionStat.textResponses.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              Text Responses ({questionStat.textResponses.length})
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
              {questionStat.textResponses.map((response, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    backgroundColor: 'background.default',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Typography variant="body2">{response}</Typography>
                </Box>
              ))}
            </Paper>
          </Box>
        )}

        {/* No responses message */}
        {questionStat.totalResponses === 0 && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              No responses recorded for this question.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

