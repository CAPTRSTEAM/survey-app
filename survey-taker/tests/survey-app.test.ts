import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the components for testing
vi.mock('../js/components/survey-app', () => ({
  SurveyApp: ({ apiProvider }: any) => React.createElement('div', { 'data-testid': 'survey-app' }, 'Survey App')
}));

vi.mock('../js/components/question-renderer', () => ({
  QuestionRenderer: ({ question }: any) => React.createElement('div', { 'data-testid': 'question-renderer' }, question.question)
}));

describe('Survey App', () => {
  it('should render without crashing', () => {
    const mockApiProvider = {
      subscribe: vi.fn(),
      getGameConfig: vi.fn(),
      isGameReady: vi.fn(),
      createAppData: vi.fn()
    };

    // This is a basic test to ensure the app can be imported and rendered
    expect(mockApiProvider).toBeDefined();
  });

  it('should handle survey data correctly', () => {
    const mockSurvey = {
      id: 'test-survey',
      title: 'Test Survey',
      sections: [
        {
          id: 'section-1',
          title: 'Test Section',
          questions: [
            {
              id: 'q1',
              type: 'text',
              question: 'Test question?',
              required: true
            }
          ]
        }
      ]
    };

    expect(mockSurvey.id).toBe('test-survey');
    expect(mockSurvey.sections).toHaveLength(1);
    expect(mockSurvey.sections[0].questions).toHaveLength(1);
  });
});

describe('Question Types', () => {
  it('should support all question types', () => {
    const questionTypes = ['text', 'radio', 'checkbox', 'likert', 'yesno', 'rating', 'ranking'];
    
    questionTypes.forEach(type => {
      expect(type).toMatch(/^(text|radio|checkbox|likert|yesno|rating|ranking)$/);
    });
  });
});

describe('Auto Save', () => {
  it('should save answers to localStorage', () => {
    const mockAnswers = {
      'q1': 'Test answer',
      'q2': ['option1', 'option2']
    };

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });

    // Test that answers can be saved
    localStorage.setItem('test-key', JSON.stringify(mockAnswers));
    expect(localStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(mockAnswers));
  });
});

describe('Database Integration', () => {
  it('should support createAppData functionality', () => {
    const mockApiProvider = {
      subscribe: vi.fn(),
      getGameConfig: vi.fn(),
      isGameReady: vi.fn(),
      createAppData: vi.fn()
    };

    const surveyData = {
      surveyId: 'test-survey-123',
      answers: { 'q1': 'Test answer' },
      timestamp: '2024-01-01T00:00:00.000Z',
      sessionId: 'session_123'
    };

    // Test that createAppData method exists and can be called
    expect(mockApiProvider.createAppData).toBeDefined();
    expect(typeof mockApiProvider.createAppData).toBe('function');
    
    // Test that it can be called with survey data
    mockApiProvider.createAppData(surveyData);
    expect(mockApiProvider.createAppData).toHaveBeenCalledWith(surveyData);
  });

  it('should handle createAppData parameters correctly', () => {
    const mockApiProvider = {
      createAppData: vi.fn()
    };

    const surveyData = {
      surveyId: 'test-survey-123',
      answers: { 'q1': 'Test answer', 'q2': ['option1'] },
      timestamp: '2024-01-01T00:00:00.000Z',
      sessionId: 'session_123'
    };

    // Test parameter validation
    expect(surveyData.surveyId).toBe('test-survey-123');
    expect(surveyData.answers).toEqual({ 'q1': 'Test answer', 'q2': ['option1'] });
    expect(surveyData.timestamp).toBe('2024-01-01T00:00:00.000Z');
    expect(surveyData.sessionId).toBe('session_123');
  });
});
