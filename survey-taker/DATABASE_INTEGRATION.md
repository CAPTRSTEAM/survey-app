# Database Integration with createAppData

The survey taker platform now includes a `createAppData` function that allows survey responses to be saved directly to the database when running in platform mode.

## Overview

The `createAppData` function is part of the `ApiProvider` class and provides a way to save survey completion data to the platform's database using the standard `/api/gameData` endpoint. This follows the same pattern used by other platform applications like `spa-api-provider`.

## How It Works

### 1. Platform Configuration

When the survey app receives a `CONFIG` message from the platform, it stores the platform configuration including:
- `token`: Authentication token for API calls
- `url`: Platform API base URL
- `exerciseId`: Exercise identifier
- `appInstanceId`: App instance identifier

### 2. Survey Completion

When a survey is completed in platform mode, the app:
1. Attempts to save the survey data using `createAppData`
2. Sends an `APP_FINISHED` event to increment finishCount and activate the next item in the sequence
3. Falls back to the legacy `postMessage` method if database save fails
4. Provides clean error handling without excessive logging

### 3. Data Structure

The survey data is saved using the `GameDataDTO` format expected by the `/api/gameData` endpoint:

```typescript
{
  exerciseId: string,
  gameConfigId: string,        // Uses appInstanceId
  organizationId: string,      // Uses exerciseId
  data: string                 // JSON stringified survey data
}
```

Where the `data` field contains the enhanced survey completion data:
```typescript
{
  // Platform Context
  exerciseId: string,
  gameConfigId: string,        // Uses appInstanceId
  organizationId: string,     // Uses exerciseId
  
  // Survey Metadata
  surveyId: string,
  surveyTitle: string,
  surveyDescription?: string,
  surveyVersion: null,         // Set to null for now
  
  // Complete Survey Structure
  surveyStructure: {
    welcome?: { title: string, message: string },
    thankYou?: { title: string, message: string },
    settings?: object,
    sections: Array<{
      id: string,
      title: string,
      description?: string,
      questions: Array<{
        id: string,
        type: string,
        question: string,
        options?: string[],
        required: boolean,
        // ... other question properties
      }>
    }>
  },
  
  // User Responses
  answers: SurveyAnswers,
  
  // Completion Metadata
  timestamp: string,
  sessionId: string,
  completedAt: string,
  timeSpent: number,           // Time in seconds from start to completion
  status: 'completed',
  type: 'survey-completion'
}
```

### Fallback Structure
If the enhanced data structure fails, the system falls back to the simple structure:
```typescript
{
  surveyId: string,
  answers: SurveyAnswers,
  timestamp: string,
  sessionId: string,
  completedAt: string,
  status: 'completed',
  type: 'survey-completion'
}
```

## Usage

### In Platform Mode

The `createAppData` function is automatically called when a survey is completed in platform mode. No additional configuration is required.

### Manual Usage

You can also call the function manually if needed:

```typescript
const surveyData = {
  surveyId: 'survey-123',
  surveyTitle: 'Employee Satisfaction Survey',
  surveyDescription: 'Please provide feedback about your work experience',
  surveyStructure: {
    welcome: { title: 'Welcome', message: 'Thank you for participating' },
    thankYou: { title: 'Thank You!', message: 'Your responses have been recorded' },
    settings: { branding: { companyName: 'CAPTRS' } },
    sections: [
      {
        id: 'work-satisfaction',
        title: 'Work Satisfaction',
        questions: [
          {
            id: 'q1',
            type: 'radio',
            question: 'How satisfied are you with your role?',
            options: ['Very Satisfied', 'Satisfied', 'Neutral'],
            required: true
          }
        ]
      }
    ]
  },
  answers: { 'q1': 'Very Satisfied', 'q2': ['option1', 'option2'] },
  timestamp: new Date().toISOString(),
  sessionId: 'session_456',
  timeSpent: 180 // 3 minutes in seconds
};

try {
  const result = await apiProvider.createAppData(surveyData);
  console.log('Survey saved successfully:', result);
} catch (error) {
  console.error('Failed to save survey:', error);
}
```

## API Endpoints

### Survey Data Storage
The `createAppData` function makes a POST request to:
```
POST {platformUrl}/api/gameData
```

### App Completion Event
The `sendAppFinishedEvent` function makes a POST request to:
```
POST {platformUrl}/api/events
```

### Headers
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

### Request Bodies

#### GameData Endpoint
The survey data payload in `GameDataDTO` format as described above.

#### Events Endpoint
The APP_FINISHED event payload:
```typescript
{
  exerciseId: string,
  gameConfigId: string,        // Uses appInstanceId
  organizationId: string,     // Uses exerciseId
  type: 'APP_FINISHED',       // Updated: changed from 'eventType' to 'type'
  timestamp: string,
  data: string                 // Updated: data field is now JSON stringified
}
```

Where the `data` field contains:
```typescript
{
  appInstanceId: string,
  exerciseId: string,
  completedAt: string,
  status: 'completed'
}
```

## Error Handling

Both functions include comprehensive error handling:
- Validates platform configuration availability
- Provides clear error messages for HTTP failures
- Gracefully falls back to postMessage if database save fails
- Falls back to simple data structure if enhanced structure fails
- APP_FINISHED event failure doesn't prevent survey completion
- No excessive logging in production builds

## Fallback Behavior

If the database save fails for any reason, the app automatically falls back to the legacy `postMessage` method to ensure survey completion data is still communicated to the platform.

## Testing

The functionality is covered by unit tests in `tests/survey-app.test.ts`:
- Tests the existence and functionality of `createAppData`
- Validates parameter handling
- Ensures proper integration with the survey completion flow

## Requirements

- Platform must provide valid `token` and `url` in CONFIG message
- Platform must support the `/api/gameData` endpoint
- Platform must support the `/api/events` endpoint for APP_FINISHED events
- Survey must be running in platform mode (`appMode === 'platform'`)

## Benefits

1. **Persistent Storage**: Survey responses are saved to the database for later analysis
2. **Reliability**: Fallback mechanism ensures data is never lost
3. **Integration**: Seamlessly integrates with existing platform infrastructure
4. **Standards Compliant**: Uses the same `/api/gameData` endpoint as other platform apps
5. **Clean Implementation**: Production-ready code without debugging overhead

## Platform Compatibility

This implementation is compatible with:
- **spa-api-provider**: Uses the same API patterns
- **data-collect**: Follows similar data structures
- **Other platform apps**: Standard `/api/gameData` endpoint usage

## Data Retrieval

Survey data can be retrieved using the `getAppData` function, which also uses the `/api/gameData` endpoint with GET requests to retrieve previously saved survey responses.

## 🔧 Recent Refactoring Improvements (v21)

### **Code Optimization**
The API provider has been significantly refactored to eliminate redundancy and improve performance:

#### **Helper Methods Added**
- `_validatePlatformConfig()` - Centralized platform configuration validation
- `_createHeaders(token)` - Consistent HTTP headers creation
- `_createBasePayload(exerciseId, appInstanceId)` - Reusable base payload structure
- `_handleResponse(response)` - Unified response handling with error recovery

#### **Performance Improvements**
- **Object Reuse**: Eliminated duplicate object creation in API calls
- **Reduced Allocations**: Optimized object spreading patterns
- **Memory Efficiency**: Removed unused properties and optimized memory usage
- **Bundle Size**: Reduced from 8.54 kB to 8.52 kB (-0.2%)

#### **Error Handling Enhancements**
- **Robust Response Parsing**: Handles empty responses and non-JSON content gracefully
- **Consistent Error Messages**: Standardized error handling across all API methods
- **Fallback Mechanisms**: Improved fallback behavior for various failure scenarios

#### **Code Maintainability**
- **DRY Principle**: Eliminated code duplication across methods
- **Single Responsibility**: Each helper method has a focused purpose
- **Consistent Patterns**: All API calls now follow the same structure
- **Better Documentation**: Enhanced JSDoc comments for all methods

### **Breaking Changes**
- **None**: All public APIs remain unchanged
- **Backward Compatible**: Existing functionality preserved
- **Performance Only**: Improvements are internal optimizations
