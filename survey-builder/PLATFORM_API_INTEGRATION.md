# Platform API Integration

The Survey Builder now integrates with the existing CAPTRS platform APIs to fetch survey responses directly from the platform database.

## Overview

Instead of connecting directly to Snowflake, the Survey Builder uses the platform's existing `/api/gameData` endpoints to retrieve survey response data. This provides:

- ✅ **Unified Authentication**: Uses existing platform authentication
- ✅ **Consistent Data Format**: Works with existing platform data structures
- ✅ **No Additional Infrastructure**: Leverages existing backend services
- ✅ **Better Security**: Goes through platform authorization layers

## API Endpoints Used

### 1. Get All Game Data
```
GET /api/gameData
```
Returns all game data entries (including survey responses).

### 2. Search Game Data
```
GET /api/searchGameData?exerciseId={id}&gameConfigId={id}&organizationId={id}&userId={id}
```
Searches for game data with specific filters.

## Configuration

Set the platform API base URL in your environment:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Or in `vite.config.ts` or build configuration.

## Data Mapping

The platform's `GameDataDTO` structure is automatically mapped to `SurveyResponse`:

**Platform Format:**
```typescript
{
  id: string
  data: JsonNode  // Contains survey response JSON
  exerciseId: string
  gameConfigId: string
  organizationId: string
  userId?: string
  creationTimestamp: number
}
```

**Mapped to:**
```typescript
{
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
```

## Survey Response Data Format

The platform expects survey responses in the `data` field with this structure:

```json
{
  "data": {
    "surveyId": "survey_123",
    "surveyTitle": "My Survey",
    "answers": {
      "q1": "answer1",
      "q2": ["option1", "option2"]
    },
    "completedAt": "2025-01-15T10:30:00Z",
    "sessionId": "session_123",
    "timeSpent": 180,
    "status": "completed"
  }
}
```

Or nested format (as stored by survey-taker):
```json
{
  "data": "{\"surveyId\":\"survey_123\",\"surveyTitle\":\"My Survey\",\"answers\":{...}}"
}
```

## Filtering by Survey ID

When you view results for a specific survey, the API:

1. Fetches all game data (or filtered by exerciseId/gameConfigId if provided)
2. Parses each entry's `data` field
3. Filters to only entries where `data.surveyId` matches the requested survey
4. Maps to `SurveyResponse` format

## Caching

Responses are cached in `sessionStorage` for 5 minutes to reduce API calls:
- Cache key: `api-responses-{surveyId}-{exerciseId}-{gameConfigId}`
- Automatically invalidated after 5 minutes
- Can be disabled by setting `useCache: false`

## Fallback Behavior

If the platform API is unavailable:
- Falls back to `localStorage` (for imported/manual data)
- Shows an info alert in the UI
- Allows manual import of CSV/JSON files

## Authentication

The platform API may require authentication. If so, you'll need to:

1. Configure authentication headers in the API service
2. Handle token refresh
3. Add error handling for 401/403 responses

See `src/services/api.ts` for the implementation.

## Usage Example

```typescript
import { fetchSurveyResponses } from '../services/api'

// Get all survey responses
const allResponses = await fetchSurveyResponses()

// Get responses for a specific survey
const surveyResponses = await fetchSurveyResponses({ surveyId: 'survey_123' })

// Get responses for a specific exercise
const exerciseResponses = await fetchSurveyResponses({ 
  exerciseId: 'exercise_456' 
})

// Get responses with multiple filters
const filteredResponses = await fetchSurveyResponses({
  surveyId: 'survey_123',
  exerciseId: 'exercise_456',
  gameConfigId: 'config_789'
})
```

## Troubleshooting

### API Not Available
- Check that `VITE_API_BASE_URL` is set correctly
- Verify the platform backend is running
- Check browser console for CORS errors

### No Responses Found
- Verify survey responses are stored in the platform database
- Check that the `data` field contains valid JSON with `surveyId`
- Ensure the survey ID matches exactly

### Authentication Errors
- Add authentication headers if required
- Check token expiration
- Verify user permissions

