export interface Question {
  id: string
  type: 'text' | 'radio' | 'checkbox' | 'rating' | 'likert'
  question: string
  required: boolean
  options?: string[]
  order?: number
}

export interface Section {
  id: string
  title: string
  description: string
  questions: Question[]
  order: number
}

export interface Welcome {
  title: string
  message: string
}

export interface ThankYou {
  title: string
  message: string
}

export interface Branding {
  companyName: string
  poweredBy: string
}

export interface Settings {
  branding: Branding
}

export interface Survey {
  id: string
  title: string
  description: string
  welcome: Welcome
  thankYou: ThankYou
  settings: Settings
  sections: Section[]
  createdAt: string
  updatedAt: string
}

export interface SurveyLibrary {
  surveys: Survey[]
}

// For compatibility with survey taker (flattened structure)
export interface FlattenedSurvey {
  id: string
  title: string
  description: string
  welcome: Welcome
  thankYou: ThankYou
  settings: Settings
  questions: Question[]
}

export interface FlattenedQuestion extends Question {
  sectionId: string
  sectionTitle: string
  sectionIndex: number
  globalOrder: number
}

export interface SnackbarState {
  open: boolean
  message: string
  severity: 'success' | 'error'
} 