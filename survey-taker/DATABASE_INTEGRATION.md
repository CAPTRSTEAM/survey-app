# Database Integration with createAppData

The survey taker platform now includes a `createAppData` function that allows survey responses to be saved directly to the database when running in platform mode.

## Overview

The `createAppData` function is part of the `ApiProvider` class and provides a way to save survey completion data to the platform's database using the standard API endpoints.

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
2. Falls back to the legacy `postMessage` method if database save fails
3. Provides detailed logging for debugging

### 3. Data Structure

The survey data saved includes:
```typescript
{
  exerciseId: string,
  appInstanceId: string,
  surveyId: string,
  answers: SurveyAnswers,
  timestamp: string,
  sessionId: string,
  completedAt: string,
  status: 'completed'
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
  answers: { 'q1': 'answer1', 'q2': ['option1', 'option2'] },
  timestamp: new Date().toISOString(),
  sessionId: 'session_456'
};

try {
  const result = await apiProvider.createAppData(surveyData);
  console.log('Survey saved successfully:', result);
} catch (error) {
  console.error('Failed to save survey:', error);
}
```

## API Endpoint

The function makes a POST request to:
```
POST {platformUrl}/api/appData
```

### Headers
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

### Request Body
The survey data payload as described above.

## Error Handling

The function includes comprehensive error handling:
- Validates platform configuration availability
- Provides detailed error messages for HTTP failures
- Logs all operations for debugging
- Gracefully falls back to postMessage if database save fails

## Fallback Behavior

If the database save fails for any reason, the app automatically falls back to the legacy `postMessage` method to ensure survey completion data is still communicated to the platform.

## Testing

The functionality is covered by unit tests in `tests/survey-app.test.ts`:
- Tests the existence and functionality of `createAppData`
- Validates parameter handling
- Ensures proper integration with the survey completion flow

## Requirements

- Platform must provide valid `token` and `url` in CONFIG message
- Platform must support the `/api/appData` endpoint
- Survey must be running in platform mode (`appMode === 'platform'`)

## Benefits

1. **Persistent Storage**: Survey responses are saved to the database for later analysis
2. **Reliability**: Fallback mechanism ensures data is never lost
3. **Integration**: Seamlessly integrates with existing platform infrastructure
4. **Debugging**: Comprehensive logging for troubleshooting
5. **Standards**: Follows the same pattern used in other platform apps (data-collect)
