import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { Survey } from '../types/survey'
import { createNewSurvey, generateId } from '../utils/surveyUtils'

const STORAGE_KEY = 'survey-library'

interface SurveyState {
  surveys: Survey[]
  loading: boolean
}

type SurveyAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SURVEYS'; payload: Survey[] }
  | { type: 'ADD_SURVEY'; payload: Survey }
  | { type: 'UPDATE_SURVEY'; payload: Survey }
  | { type: 'DELETE_SURVEY'; payload: string }
  | { type: 'DUPLICATE_SURVEY'; payload: Survey }

const surveyReducer = (state: SurveyState, action: SurveyAction): SurveyState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_SURVEYS':
      return { ...state, surveys: action.payload }
    case 'ADD_SURVEY':
      return { ...state, surveys: [...state.surveys, action.payload] }
    case 'UPDATE_SURVEY':
      return {
        ...state,
        surveys: state.surveys.map(survey => 
          survey.id === action.payload.id ? action.payload : survey
        )
      }
    case 'DELETE_SURVEY':
      return {
        ...state,
        surveys: state.surveys.filter(survey => survey.id !== action.payload)
      }
    case 'DUPLICATE_SURVEY':
      const duplicatedSurvey: Survey = {
        ...action.payload,
        id: generateId('survey'),
        title: `${action.payload.title} (Copy)`,
        sections: action.payload.sections.map(section => ({
          ...section,
          id: generateId('section'),
          questions: section.questions.map(question => ({
            ...question,
            id: generateId('question')
          }))
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      return { ...state, surveys: [...state.surveys, duplicatedSurvey] }
    default:
      return state
  }
}

interface SurveyContextType {
  surveys: Survey[]
  loading: boolean
  addSurvey: (survey: Survey) => void
  updateSurvey: (survey: Survey) => void
  deleteSurvey: (surveyId: string) => void
  duplicateSurvey: (survey: Survey) => void
  createSurvey: () => Survey
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined)

export const useSurveyContext = () => {
  const context = useContext(SurveyContext)
  if (!context) {
    throw new Error('useSurveyContext must be used within a SurveyProvider')
  }
  return context
}

interface SurveyProviderProps {
  children: ReactNode
}

export const SurveyProvider: React.FC<SurveyProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(surveyReducer, {
    surveys: [],
    loading: true
  })

  // Load surveys from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        dispatch({ type: 'SET_SURVEYS', payload: parsed.surveys || [] })
      } else {
        // Initialize with a sample survey
        const sampleSurvey: Survey = {
          id: 'sample-survey-001',
          title: 'Sample Survey',
          description: 'This is a sample survey to get you started.',
          welcome: {
            title: 'Welcome to the Survey',
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
              id: 'section-1',
              title: 'General Questions',
              description: 'Please answer the following questions.',
              questions: [
                {
                  id: 'q1',
                  type: 'radio',
                  question: 'How satisfied are you with our service?',
                  options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
                  required: true,
                  order: 1
                },
                {
                  id: 'q2',
                  type: 'text',
                  question: 'What improvements would you suggest?',
                  required: false,
                  order: 2
                }
              ],
              order: 1
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        dispatch({ type: 'SET_SURVEYS', payload: [sampleSurvey] })
      }
    } catch (error) {
      console.error('Error loading survey library:', error)
      dispatch({ type: 'SET_SURVEYS', payload: [] })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  // Save to localStorage whenever surveys change
  useEffect(() => {
    if (!state.loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ surveys: state.surveys }))
    }
  }, [state.surveys, state.loading])

  const addSurvey = (survey: Survey) => {
    dispatch({ type: 'ADD_SURVEY', payload: survey })
  }

  const updateSurvey = (survey: Survey) => {
    dispatch({ type: 'UPDATE_SURVEY', payload: survey })
  }

  const deleteSurvey = (surveyId: string) => {
    dispatch({ type: 'DELETE_SURVEY', payload: surveyId })
  }

  const duplicateSurvey = (survey: Survey) => {
    dispatch({ type: 'DUPLICATE_SURVEY', payload: survey })
  }

  const createSurvey = () => {
    const newSurvey = createNewSurvey()
    addSurvey(newSurvey)
    return newSurvey
  }

  return (
    <SurveyContext.Provider value={{
      surveys: state.surveys,
      loading: state.loading,
      addSurvey,
      updateSurvey,
      deleteSurvey,
      duplicateSurvey,
      createSurvey
    }}>
      {children}
    </SurveyContext.Provider>
  )
} 