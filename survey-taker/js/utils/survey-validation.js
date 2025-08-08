// Survey Validation Utilities
const React = window.React;

export const useSurveyValidation = () => {
    const validateSurvey = React.useCallback((surveyData) => {
        try {
            if (!surveyData || typeof surveyData !== 'object') {
                return { isValid: false, error: 'Survey data is not a valid object' };
            }

            // Check for required top-level properties
            if (!surveyData.id) {
                return { isValid: false, error: 'Survey is missing required "id" field' };
            }

            if (!surveyData.title) {
                return { isValid: false, error: 'Survey is missing required "title" field' };
            }

            // Check for either sections or questions
            const hasSections = surveyData.sections && Array.isArray(surveyData.sections) && surveyData.sections.length > 0;
            const hasQuestions = surveyData.questions && Array.isArray(surveyData.questions) && surveyData.questions.length > 0;

            if (!hasSections && !hasQuestions) {
                return { isValid: false, error: 'Survey must have either "sections" or "questions" array' };
            }

            // Validate sections if present
            if (hasSections) {
                for (let i = 0; i < surveyData.sections.length; i++) {
                    const section = surveyData.sections[i];
                    const sectionValidation = validateSection(section, i);
                    if (!sectionValidation.isValid) {
                        return { isValid: false, error: `Section ${i + 1}: ${sectionValidation.error}` };
                    }
                }
            }

            // Validate questions if present (flat structure)
            if (hasQuestions) {
                for (let i = 0; i < surveyData.questions.length; i++) {
                    const question = surveyData.questions[i];
                    const questionValidation = validateQuestion(question, i);
                    if (!questionValidation.isValid) {
                        return { isValid: false, error: `Question ${i + 1}: ${questionValidation.error}` };
                    }
                }
            }

            return { isValid: true };
        } catch (error) {
            return { isValid: false, error: `Validation error: ${error.message}` };
        }
    }, []);

    const validateSection = React.useCallback((section, index) => {
        if (!section || typeof section !== 'object') {
            return { isValid: false, error: 'Section is not a valid object' };
        }

        if (!section.id) {
            return { isValid: false, error: 'Section is missing required "id" field' };
        }

        if (!section.title) {
            return { isValid: false, error: 'Section is missing required "title" field' };
        }

        if (!section.questions || !Array.isArray(section.questions)) {
            return { isValid: false, error: 'Section must have a "questions" array' };
        }

        if (section.questions.length === 0) {
            return { isValid: false, error: 'Section must have at least one question' };
        }

        // Validate each question in the section
        for (let i = 0; i < section.questions.length; i++) {
            const question = section.questions[i];
            const questionValidation = validateQuestion(question, i);
            if (!questionValidation.isValid) {
                return { isValid: false, error: `Question ${i + 1}: ${questionValidation.error}` };
            }
        }

        return { isValid: true };
    }, []);

    const validateQuestion = React.useCallback((question, index) => {
        if (!question || typeof question !== 'object') {
            return { isValid: false, error: 'Question is not a valid object' };
        }

        if (!question.id) {
            return { isValid: false, error: 'Question is missing required "id" field' };
        }

        if (!question.question || typeof question.question !== 'string') {
            return { isValid: false, error: 'Question is missing required "question" field' };
        }

        if (!question.type || typeof question.type !== 'string') {
            return { isValid: false, error: 'Question is missing required "type" field' };
        }

        // Validate question type
        const validTypes = ['text', 'radio', 'checkbox', 'likert', 'yesno', 'rating', 'ranking'];
        if (!validTypes.includes(question.type)) {
            return { isValid: false, error: `Invalid question type: ${question.type}. Must be one of: ${validTypes.join(', ')}` };
        }

        // Validate options for question types that require them
        if (['radio', 'checkbox', 'likert', 'ranking'].includes(question.type)) {
            if (!question.options || !Array.isArray(question.options)) {
                return { isValid: false, error: `Question type "${question.type}" requires an "options" array` };
            }

            if (question.options.length === 0) {
                return { isValid: false, error: `Question type "${question.type}" must have at least one option` };
            }

            // Validate each option
            for (let i = 0; i < question.options.length; i++) {
                const option = question.options[i];
                if (typeof option !== 'string' || option.trim() === '') {
                    return { isValid: false, error: `Option ${i + 1} must be a non-empty string` };
                }
            }
        }

        // Validate required field
        if (question.required !== undefined && typeof question.required !== 'boolean') {
            return { isValid: false, error: 'Question "required" field must be a boolean' };
        }

        return { isValid: true };
    }, []);

    const validateAnswer = React.useCallback((answer, type, required) => {
        // If not required, any answer (including undefined/null) is valid
        if (!required) {
            return true;
        }

        // If required but no answer provided
        if (answer === undefined || answer === null) {
            return false;
        }

        // Validate based on question type
        switch (type) {
            case 'text':
                return typeof answer === 'string' && answer.trim().length > 0;
            
            case 'checkbox':
                return Array.isArray(answer) && answer.length > 0;
            
            case 'radio':
            case 'likert':
            case 'yesno':
                return typeof answer === 'string' && answer.length > 0;
            
            case 'rating':
                return typeof answer === 'number' && answer > 0 && answer <= 5;
            
            case 'ranking':
                return typeof answer === 'object' && answer !== null && Object.keys(answer).length > 0;
            
            default:
                return !!answer;
        }
    }, []);

    return {
        validateSurvey,
        validateSection,
        validateQuestion,
        validateAnswer
    };
};
