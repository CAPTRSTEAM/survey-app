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

Where the `data` field contains:
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
  eventType: 'APP_FINISHED',
  timestamp: string,
  data: {
    appInstanceId: string,
    exerciseId: string,
    completedAt: string,
    status: 'completed'
  }
}
```

## Error Handling

Both functions include comprehensive error handling:
- Validates platform configuration availability
- Provides clear error messages for HTTP failures
- Gracefully falls back to postMessage if database save fails
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
