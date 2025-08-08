# Question Types Alignment

This document outlines the standardized question types supported by both the Survey Builder and Survey Taker applications.

## Supported Question Types

### 1. **Text Input** (`text`)
- **Description**: Free-form text response
- **Builder Support**: ✅ Full support
- **Taker Support**: ✅ Full support
- **Options**: Not applicable
- **Validation**: Requires non-empty string if required

### 2. **Multiple Choice** (`radio`)
- **Description**: Single selection from predefined options
- **Builder Support**: ✅ Full support
- **Taker Support**: ✅ Full support
- **Options**: Required array of strings
- **Validation**: Requires one selected option if required

### 3. **Checkboxes** (`checkbox`)
- **Description**: Multiple selections from predefined options
- **Builder Support**: ✅ Full support
- **Taker Support**: ✅ Full support
- **Options**: Required array of strings
- **Validation**: Requires at least one selection if required

### 4. **Rating Scale** (`rating`)
- **Description**: 5-star rating system
- **Builder Support**: ✅ Full support
- **Taker Support**: ✅ Full support
- **Options**: Not applicable (fixed 5-star system)
- **Validation**: Requires rating 1-5 if required

### 5. **Likert Scale** (`likert`)
- **Description**: Agreement scale (Strongly Disagree to Strongly Agree)
- **Builder Support**: ✅ Full support
- **Taker Support**: ✅ Full support
- **Options**: Required array of strings (typically 5 options)
- **Validation**: Requires one selected option if required

### 6. **Yes/No** (`yesno`)
- **Description**: Simple binary choice
- **Builder Support**: ✅ Full support
- **Taker Support**: ✅ Full support
- **Options**: Required array of strings (typically ["Yes", "No"])
- **Validation**: Requires one selected option if required

### 7. **Ranking** (`ranking`)
- **Description**: Ordering preferences in a specific sequence
- **Builder Support**: ✅ Full support
- **Taker Support**: ✅ Full support
- **Options**: Required array of strings to be ranked
- **Validation**: Requires ranking object with option-to-rank mapping if required

## Question Type Specifications

### Common Properties
All question types share these properties:
- `id`: Unique identifier (string)
- `type`: Question type (one of the supported types above)
- `question`: Question text (string)
- `required`: Whether the question is required (boolean)
- `options`: Array of options (for applicable types)

### Type-Specific Requirements

#### Text Input
```json
{
  "id": "q1",
  "type": "text",
  "question": "Please provide your feedback:",
  "required": true
}
```

#### Multiple Choice
```json
{
  "id": "q2",
  "type": "radio",
  "question": "What is your favorite color?",
  "options": ["Red", "Blue", "Green", "Yellow"],
  "required": true
}
```

#### Checkboxes
```json
{
  "id": "q3",
  "type": "checkbox",
  "question": "Which programming languages do you know?",
  "options": ["JavaScript", "Python", "Java", "C++", "Go"],
  "required": false
}
```

#### Rating Scale
```json
{
  "id": "q4",
  "type": "rating",
  "question": "Rate your experience:",
  "required": true
}
```

#### Likert Scale
```json
{
  "id": "q5",
  "type": "likert",
  "question": "I enjoy working with this team.",
  "options": ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
  "required": true
}
```

#### Yes/No
```json
{
  "id": "q6",
  "type": "yesno",
  "question": "Do you recommend this product?",
  "options": ["Yes", "No"],
  "required": true
}
```

#### Ranking
```json
{
  "id": "q7",
  "type": "ranking",
  "question": "Please rank these priorities in order of importance:",
  "options": ["Salary", "Work-Life Balance", "Career Growth", "Company Culture"],
  "required": true
}
```

## Implementation Notes

### Survey Builder
- All question types are available in the question creation interface
- Options are automatically populated with sensible defaults
- Options can be customized for applicable question types
- Validation ensures required fields are properly configured

### Survey Taker
- All question types are rendered with appropriate UI components
- Validation ensures required questions are answered before proceeding
- Accessibility features are implemented for all question types
- Responsive design works across all question types

### Data Flow
1. Survey Builder creates surveys with standardized question types
2. Surveys are exported as JSON with consistent structure
3. Survey Taker imports and renders surveys using the same question types
4. Both applications use identical validation rules

## Future Considerations

### Potential Additions
- **Matrix**: Multiple questions with shared options
- **File Upload**: File attachment questions
- **Date/Time**: Date and time picker questions
- **Numeric**: Number input with validation

### Migration Strategy
When adding new question types:
1. Update TypeScript interfaces in both applications
2. Add UI components for question creation in Builder
3. Add rendering components in Taker
4. Update validation logic in both applications
5. Update documentation and examples
6. Test with sample surveys

## Testing

Both applications include sample surveys that demonstrate all supported question types. The sample survey in `survey-taker/sample-survey.json` provides examples of each question type in action.
