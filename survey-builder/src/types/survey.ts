export interface Question {
  id: string;
  type:
    | "text"
    | "radio"
    | "checkbox"
    | "rating"
    | "likert"
    | "yesno"
    | "ranking";
  question: string;
  required: boolean;
  options?: string[];
  order?: number;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  order: number;
}

export interface Welcome {
  title: string;
  message: string;
}

export interface ThankYou {
  title: string;
  message: string;
}

export interface Branding {
  companyName: string;
  poweredBy: string;
}

export interface Settings {
  branding: Branding;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  welcome: Welcome;
  thankYou: ThankYou;
  settings: Settings;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
  // Metadata for platform integration
  metadata?: {
    gameConfigId?: string;
    exerciseId?: string;
    organizationId?: string;
    [key: string]: any;
  };
}

export interface SurveyLibrary {
  surveys: Survey[];
}

// For compatibility with survey taker (flattened structure)
export interface FlattenedSurvey {
  id: string;
  title: string;
  description: string;
  welcome: Welcome;
  thankYou: ThankYou;
  settings: Settings;
  questions: Question[];
}

export interface FlattenedQuestion extends Question {
  sectionId: string;
  sectionTitle: string;
  sectionIndex: number;
  globalOrder: number;
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

// Survey Response Types
export interface SurveyResponse {
  id: string;
  surveyId: string;
  surveyTitle: string;
  answers: Record<string, any>; // questionId -> answer value
  timestamp: string;
  completedAt?: string;
  sessionId?: string;
  timeSpent?: number; // in seconds
  status: "completed" | "partial" | "abandoned";
  userId?: string;
  organizationId?: string;
  exerciseId?: string;
}

export interface QuestionStatistics {
  questionId: string;
  questionText: string;
  questionType: string;
  totalResponses: number;
  responseRate: number; // percentage
  // For choice-based questions (radio, checkbox, etc.)
  optionCounts?: Record<string, number>;
  // For text questions
  textResponses?: string[];
  // For rating/likert questions
  averageRating?: number;
  ratingDistribution?: Record<string, number>;
}

export interface SurveyStatistics {
  surveyId: string;
  totalResponses: number;
  completionRate: number;
  averageTimeSpent: number;
  questionStats: QuestionStatistics[];
  responseOverTime?: Array<{ date: string; count: number }>;
}
