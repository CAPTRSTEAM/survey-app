export interface SurveyResponse {
  id: string
  surveyId: string
  surveyTitle: string
  answers: Record<string, any>
  timestamp: string
  completedAt?: string
  sessionId?: string
  timeSpent?: number
  status: 'completed' | 'partial' | 'abandoned'
  userId?: string
  organizationId?: string
  exerciseId?: string
}

export interface SurveyResponseQuery {
  surveyId?: string
  startDate?: string
  endDate?: string
  status?: 'completed' | 'partial' | 'abandoned'
  limit?: number
  offset?: number
}

