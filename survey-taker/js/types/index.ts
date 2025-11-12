

// Survey Types
export type QuestionType = 'text' | 'radio' | 'checkbox' | 'likert' | 'yesno' | 'rating' | 'ranking';

export interface SurveyQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  required?: boolean;
  description?: string;
}

export interface SurveySection {
  id: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
}

export interface SurveyWelcome {
  title: string;
  message: string;
}

export interface SurveyThankYou {
  title: string;
  message: string;
}

export interface SurveyBranding {
  companyName?: string;
  poweredBy?: string;
}

export interface SurveySettings {
  branding?: SurveyBranding;
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
  welcome?: SurveyWelcome;
  thankYou?: SurveyThankYou;
  settings?: SurveySettings;
  sections: SurveySection[];
  questions?: SurveyQuestion[]; // Legacy support for flat question arrays
}

// Answer Types
export type AnswerValue = string | number | string[] | Record<string, number>;

export interface SurveyAnswers {
  [questionId: string]: AnswerValue;
}

// App State Types
export type AppMode = 'loading' | 'standalone' | 'platform';

export interface SurveyState {
  survey: Survey | null;
  currentSectionIndex: number;
  answers: SurveyAnswers;
  isCompleted: boolean;
  isSubmitting: boolean;
  error: string | null;
}

// Component Props Types
export interface PlatformConfigMessage {
  type?: string;
  token?: string;
  url?: string;
  exerciseId?: string;
  appInstanceId?: string;
  organizationId?: string;
  survey?: Survey;
  surveyConfig?: Survey;
  [key: string]: unknown;
}

export interface SurveyAppProps {
  platformConfig?: PlatformConfigMessage | null;
}

export interface QuestionRendererProps {
  question: SurveyQuestion;
  answer: AnswerValue | undefined;
  onChange: (questionId: string, value: AnswerValue) => void;
  disabled?: boolean;
}

export interface SurveyHeaderProps {
  survey: Survey;
  sectionProgress: SectionProgress[];
  appMode: AppMode;
}

export interface SurveyProgressProps {
  currentSection: SurveySection;
  answers: SurveyAnswers;
  dynamicStyles: DynamicStyles;
}

export interface SurveyQuestionsProps {
  currentSection: SurveySection;
  answers: SurveyAnswers;
  onChange: (questionId: string, value: AnswerValue) => void;
  isSubmitting: boolean;
  dynamicStyles: DynamicStyles;
}

export interface SurveyFooterProps {
  currentSectionIndex: number;
  totalSections: number;
  canNavigateNext: boolean;
  isSubmitting: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
}

// Utility Types
export interface SectionProgress {
  id: string;
  label: string;
  title: string;
  status: 'pending' | 'active' | 'completed';
  sectionIndex?: number;
  isWelcome?: boolean;
  isThankYou?: boolean;
}

export interface DynamicStyles {
  questionProgressTop: string;
  questionsPaddingTop: string;
}

export interface QuestionProgress {
  current: number;
  total: number;
  percentage: number;
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}
