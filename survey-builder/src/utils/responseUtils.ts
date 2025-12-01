import { SurveyResponse, QuestionStatistics, SurveyStatistics, Survey, Question } from '../types/survey'
import { fetchSurveyResponses } from '../services/api'

const RESPONSES_STORAGE_KEY = 'survey-responses'

// Load all responses from localStorage (fallback)
export const loadAllResponses = (): SurveyResponse[] => {
  try {
    const stored = localStorage.getItem(RESPONSES_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.responses || []
    }
  } catch (error) {
    console.error('Error loading responses:', error)
  }
  return []
}

// Load responses from API (primary method)
export const loadResponsesFromAPI = async (
  surveyId?: string,
  exerciseId?: string,
  gameConfigId?: string,
  useCache: boolean = true
): Promise<SurveyResponse[]> => {
  try {
    // Check cache first if enabled
    if (useCache && surveyId) {
      const cacheKey = `api-responses-${surveyId}-${exerciseId || ''}-${gameConfigId || ''}`
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        // Use cache if less than 5 minutes old
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          return data
        }
      }
    }

    // Fetch from platform API
    const responses = await fetchSurveyResponses({ 
      surveyId, 
      exerciseId, 
      gameConfigId 
    })
    
    // Cache the results
    if (useCache && surveyId) {
      const cacheKey = `api-responses-${surveyId}-${exerciseId || ''}-${gameConfigId || ''}`
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data: responses,
        timestamp: Date.now()
      }))
    }
    
    return responses
  } catch (error) {
    // Silently fallback to localStorage - connection errors are expected when backend is not running
    // Only log unexpected errors
    if (error instanceof Error && !error.message.includes('Failed to fetch') && !error.message.includes('ERR_CONNECTION_REFUSED') && error.name !== 'AbortError') {
      console.error('Error loading responses from API:', error)
    }
    // Fallback to localStorage if API fails
    if (surveyId) {
      const allResponses = loadAllResponses()
      return allResponses.filter(r => r.surveyId === surveyId)
    }
    return loadAllResponses()
  }
}

// Save responses to localStorage
export const saveResponses = (responses: SurveyResponse[]): void => {
  try {
    localStorage.setItem(RESPONSES_STORAGE_KEY, JSON.stringify({ responses }))
  } catch (error) {
    console.error('Error saving responses:', error)
  }
}

// Add a new response
export const addResponse = (response: SurveyResponse): void => {
  const responses = loadAllResponses()
  responses.push(response)
  saveResponses(responses)
}

// Get responses for a specific survey
export const getResponsesForSurvey = (surveyId: string): SurveyResponse[] => {
  const responses = loadAllResponses()
  return responses.filter(r => r.surveyId === surveyId)
}

// Import responses from JSON file
export const importResponsesFromFile = (file: File): Promise<SurveyResponse[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)
        
        // Handle different formats
        let responses: SurveyResponse[] = []
        if (Array.isArray(data)) {
          responses = data
        } else if (data.responses && Array.isArray(data.responses)) {
          responses = data.responses
        } else if (data.data) {
          // Handle platform format where data is a JSON string
          const parsedData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data
          if (parsedData.answers) {
            // Convert platform format to SurveyResponse
            responses = [{
              id: `response_${Date.now()}`,
              surveyId: parsedData.surveyId || '',
              surveyTitle: parsedData.surveyTitle || '',
              answers: parsedData.answers || {},
              timestamp: parsedData.timestamp || new Date().toISOString(),
              completedAt: parsedData.completedAt,
              sessionId: parsedData.sessionId,
              timeSpent: parsedData.timeSpent,
              status: parsedData.status || 'completed',
              userId: data.userId,
              organizationId: data.organizationId,
              exerciseId: data.exerciseId
            }]
          }
        }
        
        // Validate and add responses
        const existingResponses = loadAllResponses()
        const newResponses = [...existingResponses, ...responses]
        saveResponses(newResponses)
        resolve(responses)
      } catch (error) {
        reject(new Error('Invalid file format. Please upload a valid JSON file.'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

// Import responses from CSV (platform export format)
export const importResponsesFromCSV = (file: File): Promise<SurveyResponse[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const lines = content.split('\n').filter(line => line.trim())
        const headers = lines[0].split(',')
        
        const responses: SurveyResponse[] = []
        
        // Find the data column (usually contains JSON)
        const dataIndex = headers.findIndex(h => h.toLowerCase().includes('data'))
        
        if (dataIndex === -1) {
          reject(new Error('Could not find data column in CSV'))
          return
        }
        
        // Parse each row
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',')
          if (values.length <= dataIndex) continue
          
          try {
            // Extract JSON from data column (may be wrapped in quotes)
            let dataStr = values[dataIndex]
            if (dataStr.startsWith('"') && dataStr.endsWith('"')) {
              dataStr = dataStr.slice(1, -1)
            }
            // Handle escaped JSON strings
            dataStr = dataStr.replace(/""/g, '"')
            
            // Parse nested JSON structure
            const outerData = JSON.parse(dataStr)
            const innerData = typeof outerData.data === 'string' 
              ? JSON.parse(outerData.data) 
              : outerData.data || outerData
            
            if (innerData.answers) {
              responses.push({
                id: `response_${Date.now()}_${i}`,
                surveyId: innerData.surveyId || '',
                surveyTitle: innerData.surveyTitle || '',
                answers: innerData.answers || {},
                timestamp: innerData.timestamp || new Date().toISOString(),
                completedAt: innerData.completedAt,
                sessionId: innerData.sessionId,
                timeSpent: innerData.timeSpent,
                status: innerData.status || 'completed'
              })
            }
          } catch (error) {
            console.warn(`Failed to parse row ${i}:`, error)
            continue
          }
        }
        
        const existingResponses = loadAllResponses()
        const newResponses = [...existingResponses, ...responses]
        saveResponses(newResponses)
        resolve(responses)
      } catch (error) {
        reject(new Error('Failed to parse CSV file: ' + (error as Error).message))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

// Calculate statistics for a survey
export const calculateSurveyStatistics = (
  survey: Survey,
  responses: SurveyResponse[]
): SurveyStatistics => {
  const totalResponses = responses.length
  const completedResponses = responses.filter(r => r.status === 'completed').length
  const completionRate = totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0
  
  const totalTimeSpent = responses
    .filter(r => r.timeSpent)
    .reduce((sum, r) => sum + (r.timeSpent || 0), 0)
  const averageTimeSpent = completedResponses > 0 
    ? Math.round(totalTimeSpent / completedResponses) 
    : 0
  
  // Calculate question statistics
  const questionStats: QuestionStatistics[] = []
  
  survey.sections.forEach(section => {
    section.questions.forEach(question => {
      const stats = calculateQuestionStatistics(question, responses)
      questionStats.push(stats)
    })
  })
  
  // Calculate response over time
  const responseOverTime = calculateResponseOverTime(responses)
  
  return {
    surveyId: survey.id,
    totalResponses,
    completionRate,
    averageTimeSpent,
    questionStats,
    responseOverTime
  }
}

// Calculate statistics for a single question
export const calculateQuestionStatistics = (
  question: Question,
  responses: SurveyResponse[]
): QuestionStatistics => {
  const questionResponses = responses
    .filter(r => r.answers && r.answers[question.id] !== undefined && r.answers[question.id] !== null && r.answers[question.id] !== '')
    .map(r => r.answers[question.id])
  
  const totalResponses = questionResponses.length
  const totalPossibleResponses = responses.length
  const responseRate = totalPossibleResponses > 0 ? (totalResponses / totalPossibleResponses) * 100 : 0
  
  const stats: QuestionStatistics = {
    questionId: question.id,
    questionText: question.question,
    questionType: question.type,
    totalResponses,
    responseRate
  }
  
  // Calculate type-specific statistics
  if (question.type === 'radio' || question.type === 'yesno') {
    const optionCounts: Record<string, number> = {}
    questionResponses.forEach(response => {
      const answer = String(response)
      optionCounts[answer] = (optionCounts[answer] || 0) + 1
    })
    stats.optionCounts = optionCounts
  } else if (question.type === 'checkbox') {
    const optionCounts: Record<string, number> = {}
    questionResponses.forEach(response => {
      if (Array.isArray(response)) {
        response.forEach(option => {
          optionCounts[option] = (optionCounts[option] || 0) + 1
        })
      }
    })
    stats.optionCounts = optionCounts
  } else if (question.type === 'rating' || question.type === 'likert') {
    const numericResponses = questionResponses
      .map(r => {
        if (typeof r === 'number') return r
        if (typeof r === 'string') {
          // Try to parse as number, or find index in options
          const num = parseInt(r, 10)
          if (!isNaN(num)) return num
          const index = question.options?.indexOf(r)
          return index !== undefined && index !== -1 ? index + 1 : null
        }
        return null
      })
      .filter((r): r is number => r !== null)
    
    if (numericResponses.length > 0) {
      const sum = numericResponses.reduce((a, b) => a + b, 0)
      stats.averageRating = sum / numericResponses.length
      
      const distribution: Record<string, number> = {}
      numericResponses.forEach(r => {
        const key = String(r)
        distribution[key] = (distribution[key] || 0) + 1
      })
      stats.ratingDistribution = distribution
    }
  } else if (question.type === 'text') {
    stats.textResponses = questionResponses.map(r => String(r))
  }
  
  return stats
}

// Calculate response distribution over time
export const calculateResponseOverTime = (
  responses: SurveyResponse[]
): Array<{ date: string; count: number }> => {
  const dateMap = new Map<string, number>()
  
  responses.forEach(response => {
    const date = new Date(response.timestamp).toISOString().split('T')[0]
    dateMap.set(date, (dateMap.get(date) || 0) + 1)
  })
  
  return Array.from(dateMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

// Export responses to CSV
export const exportResponsesToCSV = (responses: SurveyResponse[], survey: Survey): void => {
  // Get all question IDs in order
  const questionIds: string[] = []
  survey.sections.forEach(section => {
    section.questions.forEach(question => {
      questionIds.push(question.id)
    })
  })
  
  // Create CSV headers
  const headers = [
    'Response ID',
    'Survey ID',
    'Survey Title',
    'Timestamp',
    'Completed At',
    'Status',
    'Time Spent (seconds)',
    ...questionIds.map(id => {
      const question = survey.sections
        .flatMap(s => s.questions)
        .find(q => q.id === id)
      return question ? `Q: ${question.question}` : id
    })
  ]
  
  // Create CSV rows
  const rows = responses.map(response => {
    const row = [
      response.id,
      response.surveyId,
      response.surveyTitle,
      response.timestamp,
      response.completedAt || '',
      response.status,
      response.timeSpent?.toString() || '',
      ...questionIds.map(id => {
        const answer = response.answers[id]
        if (answer === undefined || answer === null) return ''
        if (Array.isArray(answer)) return answer.join('; ')
        return String(answer)
      })
    ]
    return row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma or newline
      const cellStr = String(cell)
      if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
        return `"${cellStr.replace(/"/g, '""')}"`
      }
      return cellStr
    }).join(',')
  })
  
  const csvContent = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${survey.title || 'survey'}_responses_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// Export responses to JSON
export const exportResponsesToJSON = (responses: SurveyResponse[], survey: Survey): void => {
  const data = {
    survey: {
      id: survey.id,
      title: survey.title,
      description: survey.description
    },
    exportedAt: new Date().toISOString(),
    totalResponses: responses.length,
    responses
  }
  
  const dataStr = JSON.stringify(data, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${survey.title || 'survey'}_responses_${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
}

