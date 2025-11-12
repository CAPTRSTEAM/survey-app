# Testing Guide for createAppData Database Integration

This guide covers how to test the new `createAppData` functionality that saves survey responses to the database.

## 🧪 **Automated Testing**

### Running Tests
```bash
# Run all tests
npm test

# Run tests once (no watch mode)
npm test -- --run

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
The tests cover:
- ✅ Method existence and functionality
- ✅ Parameter validation
- ✅ API call behavior
- ✅ Error handling
- ✅ Different answer types
- ✅ Response processing
- ✅ **NEW!** Helper method performance
- ✅ **NEW!** Object allocation efficiency
- ✅ **NEW!** Response parsing robustness

## 🔍 **Manual Testing Scenarios**

### 1. **Platform Mode Testing**

#### Setup
1. Deploy the survey app to the platform (or run locally with `?apiUrl=&token=` overrides).
2. Confirm `token` and `url` reach the iframe (watch for the CONFIG message or provider update logs).
3. Ensure `/api/gameData` **and** `/api/events` are reachable.

#### Test Cases

**A. Successful Survey Completion**
1. Complete a survey with multiple question types.
2. Verify the Network tab shows `POST /api/gameData` and `POST /api/events` with 2xx responses.
3. Inspect the `data` payload to confirm it contains the survey structure, answers, timestamps, and session metadata.
4. Spot-check the platform database for the saved record.

**B. Partial Survey Completion**
1. Start a survey but stop before the final section.
2. Confirm no `/api/gameData` call is triggered.
3. Complete the survey.
4. Confirm `/api/gameData` is now called with full data.

**C. Database Failure Fallback**
1. Simulate a failing database (return 500 from `/api/gameData`).
2. Complete a survey.
3. Watch for a single warning in the console.
4. Confirm `window.parent.postMessage({ type: 'SURVEY_COMPLETE', … })` fires and the thank-you screen still appears.

### 2. **Answer Type Testing**

#### Text Questions
- [ ] Single line text answers
- [ ] Multi-line text answers
- [ ] Required vs optional text

#### Radio Questions
- [ ] Single selection
- [ ] Required vs optional
- [ ] Different option counts

#### Checkbox Questions
- [ ] Multiple selections
- [ ] Required vs optional
- [ ] Empty selections

#### Rating Questions
- [ ] 1-5 star ratings
- [ ] Required vs optional
- [ ] Rating changes

#### Ranking Questions
- [ ] Partial rankings (should not complete)
- [ ] Complete rankings (should complete)
- [ ] Ranking changes and removals

#### Likert Scale Questions
- [ ] Scale selections
- [ ] Required vs optional

#### Yes/No Questions
- [ ] Yes/No selections
- [ ] Required vs optional

### 3. **Data Validation Testing**

#### Survey Data Structure
Verify saved data follows GameDataDTO format:
```json
{
  "exerciseId": "string",
  "gameConfigId": "string",
  "organizationId": "string",
  "data": "{\"surveyId\":\"string\",\"answers\":{\"q1\":\"text answer\",\"q2\":[\"checkbox1\",\"checkbox2\"],\"q3\":{\"option1\":1,\"option2\":2},\"q4\":5},\"timestamp\":\"ISO string\",\"sessionId\":\"string\",\"completedAt\":\"ISO string\",\"status\":\"completed\",\"type\":\"survey-completion\"}"
}
```

#### Answer Type Validation
- [ ] Text answers are strings
- [ ] Checkbox answers are arrays
- [ ] Ranking answers are objects with numeric values
- [ ] Rating answers are numbers
- [ ] Radio/Likert answers are strings

### 4. **Error Scenarios**

#### Network Failures
- [ ] Platform URL unreachable
- [ ] Network timeout
- [ ] CORS issues

#### Authentication Failures
- [ ] Invalid token
- [ ] Expired token
- [ ] Missing token

#### Platform Errors
- [ ] 400 Bad Request
- [ ] 401 Unauthorized
- [ ] 403 Forbidden
- [ ] 500 Internal Server Error

## 🛠️ **Testing Tools**

### Console Logging
The app provides clean logging:
- API call success/failure
- Fallback behavior when needed
- Error details for troubleshooting

### Browser DevTools
- **Network Tab**: Monitor API calls to `/api/gameData`
- **Console Tab**: View logging and errors
- **Application Tab**: Check localStorage for saved answers

### Platform Monitoring
- Database logs for successful saves
- API endpoint logs for requests
- Error logs for failures

## 📊 **Performance Testing**

### Survey Size Testing
- [ ] Small surveys (1-5 questions)
- [ ] Medium surveys (6-20 questions)
- [ ] Large surveys (20+ questions)

### Concurrent Users
- [ ] Single user completion
- [ ] Multiple users simultaneously
- [ ] High load scenarios

### Response Time
- [ ] Database save time
- [ ] API response time
- [ ] Overall completion time

### Provider-Specific Checks
- [ ] CONFIG message arrives within 15 seconds (otherwise timeout UI appears)
- [ ] Query parameter overrides (`?apiUrl=&token=`) correctly initialise `spa-api-provider`
- [ ] Global overrides (`window.__SURVEY_APP_CONFIG__`) pick up automatically
- [ ] `POST /api/events` failure still allows survey completion (thank-you screen visible)
- [ ] Standalone mode never attempts authenticated requests

## 🔧 **Testing Environment Setup**

### Local Development
```bash
# Start development server
npm run dev

# Test with sample survey
# Open browser and complete survey
# Check console for createAppData calls
```

### Platform Testing
1. Upload production zip to platform
2. Configure survey data
3. Complete survey in platform environment
4. Verify database integration

### Mock Platform
Create a simple mock platform for testing:
```javascript
// Mock platform endpoint
app.post('/api/gameData', (req, res) => {
  console.log('Survey data received:', req.body);
  res.json({ success: true, id: 'mock-id' });
});
```

## 📝 **Test Results Template**

```
Test Date: _____________
Platform: _____________
Survey ID: _____________

✅ Method Exists: Yes/No
✅ API Call Made: Yes/No
✅ Database Save: Yes/No
✅ Fallback Working: Yes/No
✅ Error Handling: Yes/No

Notes:
- What worked well:
- What needs improvement:
- Any errors encountered:
- Performance observations:
```

## 🚀 **Next Steps**

1. **Deploy to Platform**: Test in real platform environment
2. **Monitor Logs**: Watch for any errors or issues
3. **Verify Data**: Check database for saved survey responses
4. **Performance**: Monitor response times and success rates
5. **User Feedback**: Gather feedback on survey completion experience

## 📞 **Support**

If you encounter issues:
1. Check console logs for error details
2. Verify platform configuration
3. Test with sample survey data
4. Check network connectivity
5. Review platform API documentation
