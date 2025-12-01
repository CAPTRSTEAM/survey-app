# Deployment Notes - Survey Results Feature

## What Was Added

### New Features
1. **Survey Results Viewing** - View and analyze survey responses
2. **Platform API Integration** - Fetches responses from `/api/gameData` endpoints
3. **Analytics & Statistics** - Question-by-question analysis with charts
4. **Import/Export** - CSV and JSON import/export functionality

### New Files
- `src/components/ResultsView.tsx` - Main results viewing component
- `src/components/QuestionAnalytics.tsx` - Per-question analytics
- `src/services/api.ts` - Platform API integration service
- `src/utils/responseUtils.ts` - Response data management utilities
- `src/vite-env.d.ts` - TypeScript environment variable types

### Modified Files
- `src/components/SurveyBuilder.tsx` - Added results view navigation
- `src/components/SurveyLibraryView.tsx` - Added "View Results" button
- `src/types/survey.ts` - Added response and statistics types
- `index.html` - Added favicon

## Testing on Platform

### Prerequisites
1. Platform backend running on `http://localhost:8080` (or configured URL)
2. At least one survey response in the database
3. Survey responses stored in `game_data` table with proper structure

### Test Steps

1. **Build the application:**
   ```bash
   cd survey-builder
   npm run build
   ```

2. **Deploy to platform:**
   - Copy `dist-designer/` contents to platform static file location
   - Or use your existing deployment process

3. **Test Results Viewing:**
   - Navigate to Survey Library
   - Click "View Results" (bar chart icon) on a survey
   - Verify responses load from platform API
   - Check statistics display correctly

4. **Test Analytics:**
   - Switch to "Analytics" tab
   - Verify question statistics display
   - Check response distributions for choice questions
   - Verify text responses show correctly

5. **Test Import/Export:**
   - Click "Import" and upload a CSV/JSON file
   - Verify responses are imported
   - Click "Export CSV" or "Export JSON"
   - Verify file downloads correctly

### Expected Behavior

**With Platform API Available:**
- Shows "Connected to platform API" message
- Automatically loads responses from database
- Statistics calculated from real data

**Without Platform API:**
- Shows "Using local storage" message
- Falls back to localStorage (for imported data)
- Import/export still works

### Configuration

Set environment variable for API base URL (if different from default):
```env
VITE_API_BASE_URL=http://your-platform-url:8080
```

Default is `http://localhost:8080`

### Troubleshooting

**No responses showing:**
- Check that survey responses exist in database
- Verify `game_data` table has entries with `surveyId` in data field
- Check browser console for API errors

**API connection errors:**
- Verify platform backend is running
- Check API base URL configuration
- Verify CORS is enabled on platform backend
- Check network tab for actual error details

**Import not working:**
- Verify file format matches platform export format
- Check browser console for parsing errors
- Ensure file is valid CSV or JSON

## API Endpoints Used

- `GET /api/gameData` - Get all game data
- `GET /api/searchGameData?exerciseId={id}&gameConfigId={id}` - Search with filters

## Data Format Expected

Survey responses should be in `game_data` table with this structure:
```json
{
  "data": {
    "surveyId": "survey_123",
    "surveyTitle": "My Survey",
    "answers": {
      "q1": "answer1"
    },
    "completedAt": "2025-01-15T10:30:00Z",
    "timeSpent": 180,
    "status": "completed"
  }
}
```

## Next Steps

1. Test with real survey data from platform
2. Verify analytics calculations are correct
3. Test with large datasets (100+ responses)
4. Add authentication if needed
5. Consider adding filtering by exerciseId/gameConfigId in UI

