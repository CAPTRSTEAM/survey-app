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

## 🔍 **Manual Testing Scenarios**

### 1. **Platform Mode Testing**

#### Setup
1. Deploy the survey app to the platform
2. Ensure platform provides valid `token` and `url` in CONFIG message
3. Verify platform supports `/api/gameData` endpoint

#### Test Cases

**A. Successful Survey Completion**
1. Complete a survey with various question types
2. Verify console shows: "Survey data saved to database successfully via /api/gameData endpoint"
3. Check platform database for saved survey data
4. Verify data structure matches expected GameDataDTO format

**B. Partial Survey Completion**
1. Start a survey but don't complete all questions
2. Verify `createAppData` is NOT called
3. Complete the survey
4. Verify `createAppData` IS called with complete data

**C. Database Failure Fallback**
1. Temporarily disable platform database
2. Complete a survey
3. Verify console shows: "Database endpoint not yet implemented, using postMessage fallback"
4. Verify fallback postMessage is sent
5. Check platform receives survey completion data

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
