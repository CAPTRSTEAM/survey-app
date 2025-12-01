# Testing Checklist - Survey Results Feature

## Pre-Build Checks ✅

- [x] No linting errors
- [x] All imports resolved
- [x] TypeScript types defined
- [x] Platform API integration complete

## Build Steps

1. **Type Check:**
   ```bash
   npm run build
   ```

2. **Start Dev Server:**
   ```bash
   npm run dev
   ```

## Testing Scenarios

### 1. Survey Results Viewing (Without Platform API)

- [ ] Navigate to Survey Library
- [ ] Click "View Results" (bar chart icon) on a survey
- [ ] Verify "Using local storage" message appears
- [ ] Verify empty state shows "No responses available"
- [ ] Test import functionality:
  - [ ] Click "Import" button
  - [ ] Upload a CSV file (platform export format)
  - [ ] Verify responses are loaded
  - [ ] Verify statistics update

### 2. Survey Results Viewing (With Platform API)

**Prerequisites:**
- Platform backend running on `http://localhost:8080`
- At least one survey response in the database

- [ ] Navigate to Survey Library
- [ ] Click "View Results" on a survey
- [ ] Verify "Connected to platform API" message appears
- [ ] Verify responses load from API
- [ ] Verify statistics are calculated correctly:
  - [ ] Total responses count
  - [ ] Completion rate
  - [ ] Average time spent
- [ ] Test Analytics tab:
  - [ ] Question-by-question statistics display
  - [ ] Response distributions for choice questions
  - [ ] Text responses display correctly
  - [ ] Rating distributions show correctly
- [ ] Test Individual Responses tab:
  - [ ] Table displays all responses
  - [ ] All columns show correct data
  - [ ] Status chips display correctly

### 3. Export Functionality

- [ ] Click "Export CSV" button
- [ ] Verify CSV file downloads
- [ ] Verify CSV contains all response data
- [ ] Click "Export JSON" button
- [ ] Verify JSON file downloads
- [ ] Verify JSON structure is correct

### 4. Import Functionality

- [ ] Import CSV file (platform export format)
- [ ] Verify responses are parsed correctly
- [ ] Verify statistics update after import
- [ ] Import JSON file
- [ ] Verify responses are parsed correctly

### 5. Error Handling

- [ ] Test with platform API unavailable:
  - [ ] Verify fallback to localStorage
  - [ ] Verify error message displays
  - [ ] Verify "Connect to Platform API" button works
- [ ] Test with invalid survey ID:
  - [ ] Verify empty state displays
  - [ ] Verify no errors in console

### 6. Performance

- [ ] Test with large number of responses (100+)
- [ ] Verify page loads in reasonable time
- [ ] Verify table scrolling is smooth
- [ ] Verify analytics calculations are fast

## Platform API Testing

### Test API Connection

```bash
# Check if platform API is running
curl http://localhost:8080/api/gameData

# Search for specific exercise
curl "http://localhost:8080/api/searchGameData?exerciseId=YOUR_EXERCISE_ID"
```

### Expected API Response Format

```json
{
  "gameData": [
    {
      "id": "response-id",
      "data": {
        "surveyId": "survey_123",
        "surveyTitle": "My Survey",
        "answers": {...}
      },
      "exerciseId": "exercise-id",
      "gameConfigId": "config-id",
      "organizationId": "org-id",
      "userId": "user-id",
      "creationTimestamp": 1234567890
    }
  ]
}
```

## Known Issues / Notes

- If platform API is not available, the app gracefully falls back to localStorage
- Import functionality still works for manual data entry
- Caching is enabled for 5 minutes to reduce API calls

## Next Steps After Testing

1. If issues found, document in GitHub issues
2. Update documentation based on findings
3. Consider adding authentication if needed
4. Add filtering by exerciseId/gameConfigId in UI if needed

