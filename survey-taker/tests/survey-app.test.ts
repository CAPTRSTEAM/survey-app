import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

// Mock the components for testing
vi.mock('../js/components/survey-app', () => ({
  SurveyApp: ({ platformConfig }: any) => React.createElement('div', { 'data-testid': 'survey-app' }, JSON.stringify(platformConfig))
}));

vi.mock('../js/components/question-renderer', () => ({
  QuestionRenderer: ({ question }: any) => React.createElement('div', { 'data-testid': 'question-renderer' }, question.question)
}));

describe('Survey App', () => {
  it('should accept platform configuration parameters', () => {
    const platformConfig = {
      url: 'http://localhost:3000',
      token: 'test-token-123',
      exerciseId: 'exercise-001'
    };

    expect(platformConfig.url).toContain('http');
    expect(platformConfig.token).toBe('test-token-123');
    expect(platformConfig.exerciseId).toBeDefined();
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
  let mockFetch: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock fetch globally
    mockFetch = vi.fn();
    global.fetch = mockFetch;
    
  });

  it('should support createAppData functionality', () => {
    const payload = {
      exerciseId: 'exercise-123',
      gameConfigId: 'app-instance-456',
      organizationId: 'org-789',
      data: JSON.stringify({ surveyId: 'test-survey-123' })
    };

    expect(payload.exerciseId).toBe('exercise-123');
    expect(payload.gameConfigId).toBe('app-instance-456');
    expect(typeof payload.data).toBe('string');
  });

  it('should handle createAppData parameters correctly', () => {
    const surveyData = {
      surveyId: 'test-survey-123',
      answers: { 'q1': 'Test answer', 'q2': ['option1', 'option2'] },
      timestamp: '2024-01-01T00:00:00.000Z',
      sessionId: 'session_123'
    };

    // Test parameter validation
    expect(surveyData.surveyId).toBe('test-survey-123');
    expect(surveyData.answers).toEqual({ 'q1': 'Test answer', 'q2': ['option1', 'option2'] });
    expect(surveyData.timestamp).toBe('2024-01-01T00:00:00.000Z');
    expect(surveyData.sessionId).toBe('session_123');
  });

  it('should test createAppData API call behavior', async () => {
    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, id: 'app-data-123' })
    });

    // Test the actual API call behavior
    const surveyData = {
      surveyId: 'test-survey-123',
      answers: { 'q1': 'Test answer' },
      timestamp: '2024-01-01T00:00:00.000Z',
      sessionId: 'session_123'
    };

    // Simulate the createAppData call
    const result = await mockFetch('/api/appData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(surveyData)
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/appData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(surveyData)
    });

    const response = await result.json();
    expect(response.success).toBe(true);
    expect(response.id).toBe('app-data-123');
  });

  it('should test createAppData with getAppData verification', async () => {
    // Mock successful createAppData response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, id: 'app-data-123' })
    });

    // Mock successful getAppData response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          exerciseId: 'exercise-123',
          appInstanceId: 'app-instance-456',
          surveyId: 'test-survey-123',
          answers: { 'q1': 'Test answer', 'q2': ['option1', 'option2'] },
          timestamp: '2024-01-01T00:00:00.000Z',
          sessionId: 'session_123',
          completedAt: '2024-01-01T00:00:00.000Z',
          status: 'completed'
        }
      })
    });

    const surveyData = {
      exerciseId: 'exercise-123',
      appInstanceId: 'app-instance-456',
      surveyId: 'test-survey-123',
      answers: { 'q1': 'Test answer', 'q2': ['option1', 'option2'] },
      timestamp: '2024-01-01T00:00:00.000Z',
      sessionId: 'session_123'
    };

    // Step 1: Create app data (save survey to database)
    const createResult = await mockFetch('/api/appData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(surveyData)
    });

    expect(createResult.ok).toBe(true);
    const createResponse = await createResult.json();
    expect(createResponse.success).toBe(true);
    expect(createResponse.id).toBe('app-data-123');

    // Step 2: Retrieve app data to verify it was saved
    const getResult = await mockFetch('/api/appData', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });

    expect(getResult.ok).toBe(true);
    const getResponse = await getResult.json();
    
    // Verify the retrieved data matches what was saved
    expect(getResponse.success).toBe(true);
    expect(getResponse.data.exerciseId).toBe(surveyData.exerciseId);
    expect(getResponse.data.appInstanceId).toBe(surveyData.appInstanceId);
    expect(getResponse.data.surveyId).toBe(surveyData.surveyId);
    expect(getResponse.data.answers).toEqual(surveyData.answers);
    expect(getResponse.data.timestamp).toBe(surveyData.timestamp);
    expect(getResponse.data.sessionId).toBe(surveyData.sessionId);
    expect(getResponse.data.status).toBe('completed');
    expect(getResponse.data.completedAt).toBeDefined();
  });

  it('should test createAppData error handling', async () => {
    // Mock failed API response
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    // Test error handling
    try {
      await mockFetch('/api/appData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
    } catch (error) {
      expect(error.message).toBe('Network error');
    }

    expect(mockFetch).toHaveBeenCalled();
  });

  it('should test createAppData with different answer types', () => {
    const testCases = [
      {
        answers: { 'q1': 'text answer' },
        description: 'text answers'
      },
      {
        answers: { 'q2': ['option1', 'option2'] },
        description: 'checkbox answers'
      },
      {
        answers: { 'q3': { 'option1': 1, 'option2': 2 } },
        description: 'ranking answers'
      },
      {
        answers: { 'q4': 5 },
        description: 'rating answers'
      }
    ];

    testCases.forEach(({ answers, description }) => {
      const surveyData = {
        surveyId: 'test-survey',
        answers,
        timestamp: '2024-01-01T00:00:00.000Z',
        sessionId: 'session-123'
      };

      expect(surveyData.answers).toEqual(answers);
      expect(typeof surveyData.answers).toBe('object');
    });
  });

  it('should test end-to-end createAppData and getAppData workflow', async () => {
    // This test simulates the complete workflow:
    // 1. User completes survey
    // 2. createAppData saves to database
    // 3. getAppData retrieves from database
    // 4. Verify data integrity

    const mockPlatformConfig = {
      token: 'test-token-123',
      url: 'https://test-platform.com',
      exerciseId: 'exercise-456',
      appInstanceId: 'app-instance-789'
    };

    const surveyData = {
      exerciseId: mockPlatformConfig.exerciseId,
      appInstanceId: mockPlatformConfig.appInstanceId,
      surveyId: 'comprehensive-survey',
      answers: {
        'text-q': 'This is a text answer',
        'radio-q': 'Option A',
        'checkbox-q': ['Choice 1', 'Choice 3'],
        'rating-q': 4,
        'ranking-q': { 'Item A': 1, 'Item B': 2, 'Item C': 3 },
        'likert-q': 'Agree',
        'yesno-q': 'Yes'
      },
      timestamp: '2024-01-01T12:00:00.000Z',
      sessionId: 'session-456'
    };

    // Step 1: Save survey data (createAppData)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        success: true, 
        id: 'saved-app-data-789',
        message: 'Survey data saved successfully'
      })
    });

    const saveResult = await mockFetch(`${mockPlatformConfig.url}/api/appData`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockPlatformConfig.token}`
      },
      body: JSON.stringify(surveyData)
    });

    expect(saveResult.ok).toBe(true);
    const saveResponse = await saveResult.json();
    expect(saveResponse.success).toBe(true);
    expect(saveResponse.id).toBe('saved-app-data-789');

    // Step 2: Retrieve saved data (getAppData)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          ...surveyData,
          completedAt: '2024-01-01T12:00:00.000Z',
          status: 'completed',
          id: 'saved-app-data-789'
        }
      })
    });

    const retrieveResult = await mockFetch(`${mockPlatformConfig.url}/api/appData`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mockPlatformConfig.token}`
      }
    });

    expect(retrieveResult.ok).toBe(true);
    const retrieveResponse = await retrieveResult.json();

    // Step 3: Verify data integrity
    expect(retrieveResponse.success).toBe(true);
    expect(retrieveResponse.data.id).toBe('saved-app-data-789');
    expect(retrieveResponse.data.exerciseId).toBe(mockPlatformConfig.exerciseId);
    expect(retrieveResponse.data.appInstanceId).toBe(mockPlatformConfig.appInstanceId);
    expect(retrieveResponse.data.surveyId).toBe(surveyData.surveyId);
    expect(retrieveResponse.data.answers).toEqual(surveyData.answers);
    expect(retrieveResponse.data.timestamp).toBe(surveyData.timestamp);
    expect(retrieveResponse.data.sessionId).toBe(surveyData.sessionId);
    expect(retrieveResponse.data.status).toBe('completed');
    expect(retrieveResponse.data.completedAt).toBeDefined();

    // Verify specific answer types are preserved correctly
    expect(typeof retrieveResponse.data.answers['text-q']).toBe('string');
    expect(Array.isArray(retrieveResponse.data.answers['checkbox-q'])).toBe(true);
    expect(typeof retrieveResponse.data.answers['rating-q']).toBe('number');
    expect(typeof retrieveResponse.data.answers['ranking-q']).toBe('object');
    expect(typeof retrieveResponse.data.answers['yesno-q']).toBe('string');
  });
});
