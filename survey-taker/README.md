# Survey Taker

This directory contains the survey taker application - a standalone HTML/JavaScript app that can display and collect survey responses.

## Files

- `index.html` - The main survey taker application
- `sample-survey.json` - Sample survey data for testing
- `vite.config.ts` - Vite configuration for development
- `package.json` - Dependencies and scripts
- `survey-taker-spa.zip` - **Platform deployment package**

## Platform Integration

The survey taker uses **spa-api-provider** for proper platform integration:

### **🔧 API Provider Features:**
- **Platform Configuration**: Receives `CONFIG` messages with platform credentials
- **Game Starting Data**: Fetches survey configuration from `/api/gameStartingData`
- **Survey Extraction**: Intelligently extracts survey data from platform response
- **Robust Error Handling**: Gracefully handles API failures and missing parameters
- **Fallback Support**: Uses sample survey if platform data unavailable
- **Completion Reporting**: Sends survey completion data back to platform

### **📡 Platform Communication:**
1. **Receives**: `{ type: 'CONFIG', token, url, exerciseId?, appInstanceId?, survey?, surveyConfig? }`
2. **Direct Survey**: Checks for survey data directly in CONFIG message
3. **API Fallback**: Uses spa-api-provider pattern with `getCurrentGameConfig` (GET /api/gameConfig)
4. **Parameter Handling**: Intelligently handles missing `exerciseId`/`appInstanceId`
5. **Extracts**: Intelligently finds survey data in various response formats
6. **Falls Back**: Uses sample survey if API fails or returns 400/403/404
7. **Sends**: `{ type: 'SURVEY_COMPLETE', data: {...} }` on completion

### **🛡️ Error Handling:**
- **Missing Parameters**: Falls back to sample survey if `token` or `url` are missing
- **API Failures**: Handles 400, 403, 404, and network errors gracefully
- **Parameter Flexibility**: Works with or without `exerciseId`/`appInstanceId`
- **CORS Issues**: Provides detailed logging for debugging platform integration
- **No Survey Data**: Uses fallback survey if platform doesn't provide survey configuration
- **Asset Loading**: Uses relative paths to avoid 403 errors on JavaScript files

### **🔍 Survey Data Extraction:**
- **Direct CONFIG**: Checks for `survey` or `surveyConfig` in CONFIG message
- **API Response**: Uses `getCurrentGameConfig` (GET /api/gameConfig) - same as spa-api-provider
- **Validation**: Ensures extracted data has valid survey structure
- **Comprehensive Logging**: Shows exactly what data is found and where
- **Flexible Formats**: Handles various platform response structures
- **Parameter Debugging**: Shows which parameters are available in CONFIG message
- **Sections Support**: Automatically flattens sections structure into questions array

### **🔧 Technical Fixes:**
- **Relative Paths**: All assets use relative paths (`./assets/`) instead of absolute paths
- **Self-Contained**: No external dependencies (removed Google Fonts)
- **System Fonts**: Uses native system font stack for better compatibility
- **Platform-Safe**: Designed to work within platform iframe restrictions
- **spa-api-provider Compatible**: Uses same API calls as official spa-api-provider
- **Sections Processing**: Handles nested sections structure from platform surveys

## Usage

### Development
```bash
npm install
npm run dev
```

This will start the survey taker on http://localhost:3001

### Build for Platform
```bash
npm run build
```

This creates a `dist` folder that can be zipped and uploaded to the platform.

### Platform Deployment
The `survey-taker-spa.zip` file is ready for platform deployment. This zip file contains:
- `index.html` - The main survey taker application with spa-api-provider
- `assets/` - Compiled JavaScript and CSS files (using relative paths)

**To deploy to the platform:**
1. Upload `survey-taker-spa.zip` to the platform CMS
2. Configure the survey data in the platform
3. The app will automatically fetch survey configuration via spa-api-provider
4. If API fails, it will gracefully fall back to sample survey

## Features

- **Standalone Mode**: Loads sample survey for testing
- **Platform Mode**: Uses spa-api-provider for platform integration
- **Welcome/Thank You Screens**: Professional survey flow
- **Multiple Question Types**: Radio, text, and more
- **Responsive Design**: Works on desktop, tablet, and mobile
- **API Integration**: Proper platform API communication with error handling
- **Robust Fallback**: Always provides a working survey experience
- **Platform-Safe**: No external dependencies or absolute paths

## Survey Data Format

The app expects survey data in this format:
```json
{
  "id": "survey-id",
  "title": "Survey Title",
  "description": "Survey description",
  "welcome": {
    "title": "Welcome Title",
    "message": "Welcome message"
  },
  "thankYou": {
    "title": "Thank You Title", 
    "message": "Thank you message"
  },
  "questions": [
    {
      "id": "q1",
      "type": "radio",
      "question": "Question text?",
      "options": ["Option 1", "Option 2"],
      "required": true
    }
  ]
}
``` 