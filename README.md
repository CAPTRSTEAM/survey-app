# Survey App

A comprehensive survey management system consisting of two main applications: **Survey Builder** and **Survey Taker**. This repository contains both applications for creating and administering surveys.

## 📁 Project Structure

```
survey-app/
├── survey-builder/     # Survey creation and management application
├── survey-taker/       # Survey administration and response collection
├── .github/           # GitHub Actions and workflows
└── README.md          # This file
```

## 🏗️ Survey Builder

The **Survey Builder** is a modern React application that allows users to create, edit, and manage surveys through an intuitive multi-step wizard interface.

### Key Features

- **Multi-Step Wizard**: Guided survey creation with 5 intuitive steps
- **Survey Library**: View, edit, duplicate, and delete existing surveys
- **Section Support**: Create multiple question sections with titles and descriptions
- **Question Types**: Text input, multiple choice, checkboxes, rating scales, Likert scales, Yes/No, and Ranking
- **localStorage Persistence**: Surveys are automatically saved locally
- **Export Functionality**: Generate JSON files compatible with the survey taker

### Technology Stack

- React 19 with TypeScript
- Material-UI (MUI) for modern UI components
- React Context + useReducer for state management
- Vite for fast development and building
- localStorage for client-side persistence

### Getting Started

```bash
cd survey-builder
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

For detailed documentation, see [survey-builder/README.md](./survey-builder/README.md)

## 📊 Survey Taker

The **Survey Taker** is a standalone HTML/JavaScript application designed for survey administration and response collection. It can be deployed as a platform application or used independently.

### Key Features

- **Platform Integration**: Uses spa-api-provider for seamless platform deployment
- **Standalone Mode**: Can run independently with sample surveys
- **Multiple Question Types**: Supports radio buttons, text inputs, Likert scales, Yes/No, ranking, and more
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Robust Error Handling**: Graceful fallback when platform integration fails
- **Professional UI**: Welcome and thank you screens with branding support
- **Auto-Save Functionality**: Automatically saves user progress to localStorage
- **Performance Monitoring**: Built-in performance tracking and optimization
- **TypeScript Integration**: Full type safety and better development experience

### Platform Integration

The survey taker is designed to work within platform environments:

- **CONFIG Messages**: Receives platform configuration with survey data
- **API Communication**: Fetches survey configuration from platform APIs
- **Completion Reporting**: Sends survey responses back to the platform
- **Error Handling**: Falls back to sample survey if platform integration fails

### Technology Stack

- TypeScript for type safety and better development experience
- Vanilla HTML/JavaScript (no framework dependencies)
- CSS for styling and responsive design
- spa-api-provider pattern for platform integration
- Self-contained assets for platform deployment
- Performance monitoring and auto-save functionality

### Getting Started

```bash
cd survey-taker
npm install
npm run dev
```

The application will be available at `http://localhost:3001`

For detailed documentation, see [survey-taker/README.md](./survey-taker/README.md)

## 🔄 Workflow

### Creating and Deploying Surveys

1. **Create Survey**: Use the Survey Builder to create a new survey
   - Follow the 5-step wizard to configure survey details
   - Add sections and questions as needed
   - Export the survey as a JSON file

2. **Deploy Survey**: Use the Survey Taker to administer the survey
   - Upload the survey JSON to the platform
   - Configure platform settings
   - Share the survey link with participants

3. **Collect Responses**: The Survey Taker handles response collection
   - Participants complete surveys through the web interface
   - Responses are sent back to the platform
   - Data can be analyzed through platform tools

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Local Development

Both applications can be developed independently:

```bash
# Survey Builder
cd survey-builder
npm install
npm run dev

# Survey Taker (in another terminal)
cd survey-taker
npm install
npm run dev
```

### Building for Production

```bash
# Survey Builder
cd survey-builder
npm run build

# Survey Taker
cd survey-taker
npm run build
```

## 📋 Survey Data Format

Both applications use a consistent JSON format for survey data:

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
    },
    {
      "id": "q2",
      "type": "likert",
      "question": "Statement to rate?",
      "options": ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
      "required": true
    }
  ]
}
```

## 🚀 Deployment

### Survey Builder

The Survey Builder is designed for local use and development. Builds can be deployed to static hosting services.

### Survey Taker

The Survey Taker includes a deployment package (`survey-taker-spa.zip`) ready for platform deployment:

1. Upload `survey-taker-spa.zip` to the platform CMS
2. Configure survey data in the platform
3. The app automatically fetches survey configuration
4. If API fails, it gracefully falls back to sample survey

## 🤝 Contributing

1. Follow the existing code structure in each application
2. Maintain TypeScript type safety in the Survey Builder
3. Test with various survey configurations
4. Ensure compatibility between Survey Builder and Survey Taker
5. Follow platform integration patterns for the Survey Taker

## 📄 License

This project is part of the CAPTRS survey ecosystem.

## 🔗 Related Documentation

- [Survey Builder Documentation](./survey-builder/README.md)
- [Survey Taker Documentation](./survey-taker/README.md)
- [Development Guide](./DEVELOPMENT.md) - Development practices and recent improvements
- [Question Types](./QUESTION_TYPES.md) - Supported question type specifications
- [Platform Integration Guide](./survey-taker/README.md#platform-integration)
