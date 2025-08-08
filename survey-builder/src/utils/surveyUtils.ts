import { Survey, Question, Section, FlattenedSurvey } from '../types/survey'

export const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const createNewSurvey = (): Survey => {
  return {
    id: generateId('survey'),
    title: 'New Survey',
    description: '',
    welcome: {
      title: 'Welcome',
      message: 'Thank you for participating in our survey.'
    },
    thankYou: {
      title: 'Thank You!',
      message: 'Your responses have been recorded. Thank you for your time.'
    },
    settings: {
      branding: {
        companyName: 'CAPTRS',
        poweredBy: 'Powered by CAPTRS'
      }
    },
    sections: [
      {
        id: generateId('section'),
        title: 'General Questions',
        description: 'Please answer the following questions.',
        questions: [],
        order: 1
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

export const createNewQuestion = (): Question => {
  return {
    id: generateId('question'),
    type: 'text',
    question: '',
    required: false,
    options: [],
    order: 1
  }
}

export const createNewSection = (): Section => {
  return {
    id: generateId('section'),
    title: 'New Section',
    description: 'Section description',
    questions: [],
    order: 1
  }
}

export const getQuestionTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    text: 'Text Input',
    radio: 'Multiple Choice',
    checkbox: 'Checkboxes',
    rating: 'Rating Scale',
    likert: 'Likert Scale',
    yesno: 'Yes/No',
    ranking: 'Ranking'
  }
  return labels[type] || type
}

export const getDefaultOptions = (type: string): string[] => {
  const defaults: Record<string, string[]> = {
    radio: ['Option 1', 'Option 2', 'Option 3'],
    checkbox: ['Option 1', 'Option 2', 'Option 3'],
    rating: ['1', '2', '3', '4', '5'],
    likert: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    yesno: ['Yes', 'No'],
    ranking: ['Option 1', 'Option 2', 'Option 3', 'Option 4']
  }
  return defaults[type] || []
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getTotalQuestions = (survey: Survey): number => {
  return survey.sections.reduce((total, section) => total + section.questions.length, 0)
}

export const flattenSurveyForExport = (survey: Survey): FlattenedSurvey => {
  const flattenedQuestions: Question[] = []
  let questionOrder = 1

  survey.sections.forEach(section => {
    section.questions.forEach(question => {
      flattenedQuestions.push({
        ...question,
        order: questionOrder++
      })
    })
  })

  return {
    id: survey.id,
    title: survey.title,
    description: survey.description,
    welcome: survey.welcome,
    thankYou: survey.thankYou,
    settings: survey.settings,
    questions: flattenedQuestions
  }
}

// Export with section structure for survey taker
export const exportSurveyWithSections = (survey: Survey): void => {
  const dataStr = JSON.stringify(survey, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${survey.title || 'survey'}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export const exportSurvey = (survey: Survey): void => {
  const flattenedSurvey = flattenSurveyForExport(survey)
  const dataStr = JSON.stringify(flattenedSurvey, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${survey.title || 'survey'}.json`
  link.click()
  URL.revokeObjectURL(url)
} 