# Database Integration with `spa-api-provider`

The survey taker now delegates all authenticated API calls to the official `spa-api-provider` React context. This keeps the app aligned with the latest platform expectations while still providing the rich analytics payload we designed for anonymous surveys.

## End-to-End Flow

1. **Configuration**  
   - `js/app.ts` forwards any `CONFIG` message (or local override) into the provider via `updateProviderConfig`.
   - `SurveyApp` consumes the context (`useApi()`) and derives `exerciseId`, `appInstanceId`, `organizationId`, and survey metadata from the platform payload.

2. **Response capture**  
   - When the user completes a survey, the component builds a `GameDataDTO` payload that includes the full survey structure, answers, timestamps, and calculated `timeSpent`.

3. **Persistence**  
   - `createAppData(JSON.stringify(payload))` writes to `POST /api/gameData`.
   - After a successful save, the app issues `addEvent({ type: AddEventDTOType.APP_FINISH, data: … })` which increments the platform sequence `finishCount`.
   - If the save fails, the app falls back to posting a `SURVEY_COMPLETE` message so upstream workflows still receive the payload.

4. **Resilience**  
   - Database and event failures are logged once, do not block the thank-you screen, and keep the UI responsive.

## Request Payloads

### Game data (`POST /api/gameData`)
```json
{
  "exerciseId": "exercise-123",
  "gameConfigId": "app-instance-456",
  "organizationId": "exercise-123",
  "data": "{\"surveyId\":\"employee-sat\",\"surveyTitle\":\"Employee Satisfaction\",\"surveyDescription\":\"Internal pulse check\",\"surveyStructure\":{\"welcome\":{\"title\":\"Welcome\",\"message\":\"Thanks for helping.\"},\"thankYou\":{\"title\":\"Done!\",\"message\":\"We appreciate it.\"},\"settings\":{\"branding\":{\"companyName\":\"CAPTRS\"}},\"sections\":[{\"id\":\"work\",\"title\":\"Work\",\"questions\":[{\"id\":\"q1\",\"type\":\"radio\",\"question\":\"How satisfied are you?\",\"required\":true}]}]},\"answers\":{\"q1\":\"Very satisfied\"},\"timestamp\":\"2025-02-11T01:00:00.000Z\",\"sessionId\":\"session_1739251200000\",\"timeSpent\":185,\"completedAt\":\"2025-02-11T01:03:05.000Z\",\"status\":\"completed\",\"type\":\"survey-completion\"}"
}
```

### Completion event (`POST /api/events`)
```json
{
  "exerciseId": "exercise-123",
  "gameConfigId": "app-instance-456",
  "organizationId": "exercise-123",
  "type": "APP_FINISH",
  "timestamp": "2025-02-11T01:03:05.000Z",
  "data": "{\"appInstanceId\":\"app-instance-456\",\"exerciseId\":\"exercise-123\",\"completedAt\":\"2025-02-11T01:03:05.000Z\",\"status\":\"completed\"}"
}
```

> `organizationId` defaults to the exercise id because the public survey flow does not expose tenant information yet. Adjust when the backend sends a dedicated organisation identifier.

## Manual Usage Example

When writing new components (e.g., analytics exports) you can reuse the same context helpers:

```tsx
import { useApi, AddEventDTOType } from 'spa-api-provider';

export const SubmitButton = () => {
  const { createAppData, addEvent, providerConfig } = useApi();

  const handleSubmit = async () => {
    const payload = {
      exerciseId: providerConfig?.apiUrl ?? '',
      gameConfigId: 'app-instance-id',
      organizationId: 'exercise-id',
      data: JSON.stringify({ /* ...survey completion... */ })
    };

    await createAppData(JSON.stringify(payload));
    await addEvent({
      type: AddEventDTOType.APP_FINISH,
      data: JSON.stringify({ appInstanceId: 'app-instance-id', status: 'completed' })
    });
  };

  return <button onClick={handleSubmit}>Submit</button>;
};
```

## Error Handling & Fallbacks

- Missing `apiUrl`/`token` → `spa-api-provider` waits for a valid config; the UI stays on the loading screen.
- `createAppData` failure → logged once, `SURVEY_COMPLETE` message is posted, and the thank-you screen still renders.
- `addEvent` failure → logged as a warning; does not block survey completion.
- Standalone mode → no API calls are attempted; the user can download responses separately if needed.

## Testing Checklist

Automated tests covering the persistence pathway live in `tests/survey-app.test.ts`:
- Verifies payload construction (`exerciseId`, `gameConfigId`, `organizationId`).
- Ensures fallback behaviour when the POST fails.
- Confirms the provider exports (`createAppData`, `addEvent`) are available.

Manual scenarios to exercise after each release:
- Successful completion with a real token (observe `/api/gameData` calls in the Network tab).
- Simulated network failure (ensure the thank-you screen still appears and `SURVEY_COMPLETE` fires).
- Event endpoint unavailable (the survey should still finish gracefully).

## Requirements

- Valid `CONFIG` message (or local override) containing `token` and `url`.
- Platform must expose `/api/gameData` and `/api/events`.
- Survey must run in platform/iframe mode for automatic persistence.

For more details on deployment and testing see the root [README](./README.md), [TESTING_GUIDE](./TESTING_GUIDE.md), and [DEPLOYMENT_GUIDE](./DEPLOYMENT_GUIDE.md).
