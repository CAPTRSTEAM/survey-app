import type { Survey, ValidationResult, AnswerValue, QuestionType } from '../types/index.js';

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export const useSurveyValidation: () => {
    validateSurvey: (surveyData: Survey) => ValidationResult;
    validateSection: (section: SurveySection, index: number) => ValidationResult;
    validateQuestion: (question: SurveyQuestion, index: number) => ValidationResult;
    validateAnswer: (answer: AnswerValue | undefined, type: QuestionType, required?: boolean, totalRankingOptions?: number) => boolean;
};
