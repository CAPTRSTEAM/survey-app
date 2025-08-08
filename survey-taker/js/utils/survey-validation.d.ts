import type { Survey, ValidationResult, AnswerValue, QuestionType } from '../types/index.js';

export declare function useSurveyValidation(): {
  validateSurvey: (survey: Survey) => ValidationResult;
  validateAnswer: (answer: AnswerValue | undefined, type: QuestionType, required?: boolean) => boolean;
};
