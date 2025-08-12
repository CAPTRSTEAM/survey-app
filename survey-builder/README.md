# Survey Builder

A modern React-based survey builder application with a multi-step wizard interface for creating and managing surveys. Built with TypeScript, Material-UI, and React Context for reliable state management.

## 🚀 Features

### **Survey Management**
- **Survey Library**: View, edit, duplicate, and delete existing surveys
- **Multi-Step Wizard**: Guided survey creation with 5 intuitive steps
- **Section Support**: Create multiple question sections with titles and descriptions
- **localStorage Persistence**: Surveys are automatically saved locally

### **Question Types**
- **Text Input**: Free-form text responses
- **Multiple Choice**: Single selection from predefined options
- **Checkboxes**: Multiple selections from predefined options
- **Rating Scale**: Numeric ratings (1-5, 1-10, etc.)
- **Likert Scale**: Agreement-based responses (Strongly Disagree to Strongly Agree)
- **Yes/No**: Simple binary choice questions
- **Ranking**: Ordering preferences in a specific sequence

### **Survey Structure**
- **Welcome Section**: Customizable title and message
- **Multiple Question Sections**: Each with its own title, description, and question set
- **Thank You Section**: Customizable completion message
- **Export Compatibility**: Generates JSON compatible with survey taker

## 🛠️ Technology Stack

- **React 19**: Latest React with hooks and functional components
- **TypeScript**: Full type safety and better development experience
- **Material-UI (MUI)**: Modern, accessible UI components
- **React Context + useReducer**: Reliable state management
- **Vite**: Fast development and build tooling
- **localStorage**: Client-side persistence

## 📁 Project Structure

```
survey-builder/
├── src/
│   ├── components/
│   │   ├── wizard/           # Multi-step wizard components
│   │   │   ├── BasicInfoStep.tsx
│   │   │   ├── QuestionsStep.tsx
│   │   │   ├── ReviewStep.tsx
│   │   │   ├── ThankYouStep.tsx
│   │   │   └── WelcomeStep.tsx
│   │   ├── SurveyBuilder.tsx    # Main orchestrating component
│   │   ├── SurveyLibraryView.tsx # Survey library display
│   │   └── SurveyWizard.tsx     # Wizard container
│   ├── context/
│   │   └── SurveyContext.tsx    # React Context state management
│   ├── hooks/
│   │   └── useWizard.ts         # Custom wizard navigation hook
│   ├── types/
│   │   └── survey.ts            # TypeScript interfaces
│   ├── utils/
│   │   └── surveyUtils.ts       # Utility functions
│   ├── App.tsx                  # Root component
│   └── main.tsx                 # Entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
cd survey-builder
npm install
```

### Development
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

## 📖 Usage Guide

### Creating a New Survey
1. Click "Create New Survey" in the library view
2. Follow the 5-step wizard:
   - **Basic Information**: Set survey title and description
   - **Welcome Section**: Configure welcome message
   - **Questions**: Add sections and questions
   - **Thank You Section**: Configure completion message
   - **Review & Save**: Review and save the survey

### Managing Surveys
- **Edit**: Click the edit icon to modify existing surveys
- **Duplicate**: Create a copy with "Copy" suffix
- **Delete**: Remove surveys with confirmation dialog
- **Export**: Download survey as JSON file

### Adding Questions
1. In the Questions step, click "Add Section" to create a new section
2. Fill in section title and description (only shown when adding)
3. Click "Add Question" within any section to add questions
4. Select question type from visual picker with icons and descriptions
5. Configure question options and required status
6. Use up/down arrows (left of section titles) to reorder sections
7. Questions are automatically saved as you work

### Question Section Management
- **Card-Based Interface**: Each section displays as a modern card with gradient header
- **Progressive Disclosure**: Add Question forms appear only when needed
- **Visual Question Types**: Icon-based picker showing all 7 question types with descriptions
- **Independent Forms**: Multiple sections can show Add Question forms simultaneously
- **Intuitive Reordering**: Up/down arrow controls positioned next to section titles

## 🔧 Configuration

### Survey Export Format
Surveys are exported in a flattened JSON format compatible with the survey taker:

```json
{
  "id": "survey_123",
  "title": "Survey Title",
  "description": "Survey description",
  "welcome": {
    "title": "Welcome",
    "message": "Welcome message"
  },
  "thankYou": {
    "title": "Thank You",
    "message": "Thank you message"
  },
  "settings": {
    "branding": {
      "companyName": "CAPTRS",
      "poweredBy": "Powered by CAPTRS"
    }
  },
  "questions": [
    {
      "id": "q1",
      "type": "radio",
      "question": "How satisfied are you?",
      "required": true,
      "options": ["Very Satisfied", "Satisfied", "Neutral"],
      "order": 1
    }
  ]
}
```

### localStorage Key
Surveys are stored in localStorage under the key: `survey-library`

## 🎨 Customization

### Styling
The application uses Material-UI theming. Customize colors and styling in `src/App.tsx`:

```typescript
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' }
  }
})
```

### Question Types
Add new question types by:
1. Updating `src/types/survey.ts` Question interface
2. Adding type to `src/utils/surveyUtils.ts` getQuestionTypeLabel()
3. Adding default options in `getDefaultOptions()`
4. Updating the QuestionsStep component

## 🐛 Troubleshooting

### Common Issues
- **Surveys not appearing**: Check localStorage in browser dev tools
- **Build errors**: Ensure TypeScript is properly configured
- **Import errors**: Verify all dependencies are installed

### Development Tips
- Use browser dev tools to inspect localStorage
- Check console for any error messages
- Verify TypeScript compilation with `npm run build`

## 📄 License

This project is part of the CAPTRS survey ecosystem.

## 🤝 Contributing

1. Follow the existing code structure
2. Maintain TypeScript type safety
3. Test with various survey configurations
4. Ensure compatibility with survey taker 