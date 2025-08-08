import React from 'react';
import type { SurveyAppProps, Survey, SurveyAnswers, AppMode, SectionProgress, AnswerValue } from '../types/index.js';
import { SurveyHeader } from './survey-header.js';
import { SurveyProgress } from './survey-progress.js';
import { SurveyQuestions } from './survey-questions.js';
import { SurveyFooter } from './survey-footer.js';
import { useDynamicPositioning } from '../utils/dynamic-positioning.js';
import { useSurveyValidation } from '../utils/survey-validation.js';
import { useAutoSave } from '../hooks/use-auto-save.js';
import { usePerformanceTracking } from '../hooks/use-performance-tracking.js';

export const SurveyApp: React.FC<SurveyAppProps> = ({ apiProvider }) => {
  // Performance tracking
  usePerformanceTracking('SurveyApp');

  // State
  const [survey, setSurvey] = React.useState<Survey | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = React.useState(-1); // Start at -1 for welcome screen
  const [answers, setAnswers] = React.useState<SurveyAnswers>({});
  const [isCompleted, setIsCompleted] = React.useState(false);
  const [appMode, setAppMode] = React.useState<AppMode>('loading');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Custom hooks
  const dynamicStyles = useDynamicPositioning(currentSectionIndex);
  const { validateSurvey, validateAnswer } = useSurveyValidation();
  const { loadSavedAnswers, clearSavedAnswers } = useAutoSave(survey?.id || null, answers);

  // Handle survey file upload
  const handleSurveyLoad = React.useCallback((surveyData: Survey) => {
    try {
      // Validate survey structure
      const validationResult = validateSurvey(surveyData);
      if (validationResult.isValid) {
        const processedSurvey = processSurveyStructure(surveyData);
        setSurvey(processedSurvey);
        setError(null);
        
        // Load saved answers for this survey
        const savedAnswers = loadSavedAnswers();
        if (Object.keys(savedAnswers).length > 0) {
          setAnswers(savedAnswers);
        }
      } else {
        setError(`Invalid survey configuration: ${validationResult.error}`);
      }
    } catch (error) {
      console.error('Error processing uploaded survey:', error);
      setError('Failed to process survey file');
    }
  }, [validateSurvey, loadSavedAnswers]);

  // Handle file selection
  const handleFileSelect = React.useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setError('Please select a valid JSON file');
      return;
    }

    try {
      const text = await file.text();
      const surveyData = JSON.parse(text);

      // Basic validation
      if (!surveyData || typeof surveyData !== 'object') {
        throw new Error('Invalid JSON structure');
      }

      if (!surveyData.title) {
        throw new Error('Survey must have a title');
      }

      // Process the survey
      handleSurveyLoad(surveyData);
    } catch (error) {
      console.error('Error loading survey file:', error);
      setError(`Failed to load survey: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [handleSurveyLoad]);

  // Handle file input change
  const handleFileInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Trigger file input
  const triggerFileInput = React.useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // Initialize app with API provider
  React.useEffect(() => {
    try {
      // Check if running in iframe (platform mode)
      if (window.parent !== window) {
        setAppMode('platform');
        
        // Subscribe to API provider updates
        apiProvider.subscribe((surveyConfig) => {
          if (surveyConfig) {
            // Validate survey structure
            const validationResult = validateSurvey(surveyConfig);
            if (validationResult.isValid) {
              const processedSurvey = processSurveyStructure(surveyConfig);
              setSurvey(processedSurvey);
              setError(null);
              
              // Load saved answers for this survey
              const savedAnswers = loadSavedAnswers();
              if (Object.keys(savedAnswers).length > 0) {
                setAnswers(savedAnswers);
              }
            } else {
              setError(`Invalid survey configuration: ${validationResult.error}`);
            }
          }
        });

        // Send ready message to platform
        window.parent.postMessage({
          type: 'SURVEY_APP_READY',
          message: 'Survey app is ready to receive configuration'
        }, '*');
      } else {
        // Standalone mode - show file upload or sample survey
        setAppMode('standalone');
        // Don't auto-load sample survey, let user choose
      }
    } catch (error) {
      console.error('Error initializing survey app:', error);
      setError('Failed to initialize survey application');
    }
  }, [apiProvider, validateSurvey, loadSavedAnswers]);

  // Process survey structure to handle sections
  const processSurveyStructure = React.useCallback((surveyData: Survey): Survey => {
    if (!surveyData) return surveyData;
    
    // Keep the original structure with sections for the new layout
    if (surveyData.sections && Array.isArray(surveyData.sections)) {
      return surveyData;
    }
    
    // If survey has a flat questions array, convert to sections format
    if ((surveyData as any).questions && Array.isArray((surveyData as any).questions)) {
      return {
        ...surveyData,
        sections: [{
          id: 'main-section',
          title: surveyData.title || 'Questions',
          description: surveyData.description || '',
          questions: (surveyData as any).questions
        }]
      };
    }
    
    return surveyData;
  }, []);

  const handleAnswerChange = React.useCallback((questionId: string, value: AnswerValue) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  const handleComplete = React.useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      // Clear saved answers on completion
      clearSavedAnswers();
      
      // Send completion data to platform
      if (appMode === 'platform') {
        window.parent.postMessage({
          type: 'SURVEY_COMPLETE',
          data: {
            surveyId: survey?.id,
            answers,
            timestamp: new Date().toISOString(),
            sessionId: `session_${Date.now()}`
          }
        }, '*');
      }
      
      console.log('Survey completed:', { surveyId: survey?.id, answers });
      setIsCompleted(true);
    } catch (error) {
      console.error('Error completing survey:', error);
      setError('Failed to submit survey responses');
    } finally {
      setIsSubmitting(false);
    }
  }, [appMode, survey, answers, clearSavedAnswers]);

  // Navigation helpers
  const canNavigateNext = React.useCallback(() => {
    const currentSection = survey?.sections?.[currentSectionIndex];
    if (!currentSection) return false;

    return currentSection.questions.every(q => {
      const answer = answers[q.id];
      return validateAnswer(answer, q.type, q.required);
    });
  }, [survey, currentSectionIndex, answers, validateAnswer]);

  const handleNext = React.useCallback(() => {
    if (currentSectionIndex < (survey?.sections?.length || 0) - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentSectionIndex, survey, handleComplete]);

  const handlePrevious = React.useCallback(() => {
    setCurrentSectionIndex(prev => Math.max(0, prev - 1));
  }, []);

  // Section progress for header
  const createSectionProgress = React.useCallback((): SectionProgress[] => {
    if (!survey?.sections) return [];

    const sections: SectionProgress[] = [];
    
    // Welcome section
    if (survey.welcome) {
      sections.push({
        id: 'welcome',
        label: 'W',
        title: 'Welcome',
        status: 'pending',
        isWelcome: true
      });
    }

    // Question sections
    survey.sections.forEach((section, index) => {
      sections.push({
        id: section.id,
        label: (index + 1).toString(),
        title: section.title,
        status: 'pending',
        sectionIndex: index
      });
    });

    // Thank you section
    if (survey.thankYou) {
      sections.push({
        id: 'thank-you',
        label: 'T',
        title: 'Thank You',
        status: 'pending',
        isThankYou: true
      });
    }

    return sections.map((section, index) => {
      let status: 'pending' | 'active' | 'completed' = 'pending';
      
      if (section.isWelcome && currentSectionIndex === -1) {
        status = 'active';
      } else if (section.isThankYou && isCompleted) {
        status = 'active';
      } else if (section.sectionIndex !== undefined) {
        if (section.sectionIndex < currentSectionIndex) {
          status = 'completed';
        } else if (section.sectionIndex === currentSectionIndex) {
          status = 'active';
        }
      }

      return { ...section, status, index };
    });
  }, [survey, currentSectionIndex, isCompleted]);

  // Show loading
  if (appMode === 'loading') {
    return React.createElement('div', { className: 'loading' }, 'Loading survey...');
  }

  // Show error
  if (error) {
    return React.createElement('div', { className: 'error-message' }, error);
  }

  // Show standalone mode with file upload options
  if (appMode === 'standalone' && !survey) {
    return React.createElement('div', { className: 'survey-app' },
      React.createElement('div', { className: 'mode-indicator' }, `Mode: ${appMode}`),
      
      // Hidden file input
      React.createElement('input', {
        ref: fileInputRef,
        type: 'file',
        accept: '.json,application/json',
        onChange: handleFileInputChange,
        style: { display: 'none' }
      }),
      
      // Header for standalone mode
      React.createElement('header', { className: 'survey-header' },
        React.createElement('div', { className: 'header-content' },
          React.createElement('div', { className: 'header-brand' },
            React.createElement('img', { 
              src: './CAPTRS_StackedLogo_White_Square-01-01.png',
              alt: 'CAPTRS Logo',
              className: 'brand-logo'
            }),
            React.createElement('h1', { className: 'brand-title' }, 'Standalone Survey Taker App')
          )
        )
      ),
      
      // Standalone content
      React.createElement('main', { 
        className: 'questions-container',
        style: { paddingTop: 'calc(var(--header-height) + var(--space-8))' }
      },
        React.createElement('div', { className: 'standalone-mode' },
          React.createElement('div', { className: 'standalone-header' },
            React.createElement('h1', { className: 'standalone-title' }, 'Standalone Survey Taker App')
          ),
          React.createElement('div', { className: 'standalone-actions' },
            React.createElement('button', {
              onClick: triggerFileInput,
              className: 'button button--primary',
              'aria-label': 'Upload survey file'
            }, 'Upload Survey File')
          ),
          error && React.createElement('div', { className: 'file-upload-error' },
            React.createElement('span', { className: 'error-icon', 'aria-hidden': 'true' }, '⚠️'),
            React.createElement('span', null, error)
          )
        )
      )
    );
  }

  // Show welcome screen
  if (survey?.welcome && currentSectionIndex === -1) {
    return React.createElement('div', { className: 'survey-app' },
      React.createElement('div', { className: 'mode-indicator' }, `Mode: ${appMode}`),
      
      // Header for welcome screen
      React.createElement('header', { className: 'survey-header' },
        React.createElement('div', { className: 'header-content' },
          React.createElement('div', { className: 'header-brand' },
            React.createElement('img', { 
              src: './CAPTRS_StackedLogo_White_Square-01-01.png',
              alt: 'CAPTRS Logo',
              className: 'brand-logo'
            }),
            React.createElement('h1', { className: 'brand-title' }, survey?.title || 'CAPTRS Survey')
          ),
          React.createElement('div', { className: 'header-progress', 'aria-label': 'Survey progress' },
            React.createElement('div', { className: 'progress-step active' }, 'W')
          )
        )
      ),
      
      // Welcome content
      React.createElement('main', { 
        className: 'questions-container',
        style: { paddingTop: 'calc(var(--header-height) + var(--space-8))' }
      },
        React.createElement('div', { className: 'welcome-screen' },
          React.createElement('h1', { className: 'survey-title' }, survey.welcome.title),
          React.createElement('p', { className: 'welcome-message' }, survey.welcome.message),
          React.createElement('button', {
            onClick: () => setCurrentSectionIndex(0),
            className: 'button button--primary button--lg',
            style: { marginTop: 'var(--space-8)' }
          }, 'Start Survey'),
          survey.settings?.branding && React.createElement('div', { className: 'branding' },
            survey.settings.branding.companyName && 
              React.createElement('div', { className: 'company-name' }, survey.settings.branding.companyName),
            survey.settings.branding.poweredBy && 
              React.createElement('div', { className: 'powered-by' }, survey.settings.branding.poweredBy)
          )
        )
      )
    );
  }

  // Show thank you screen
  if (survey?.thankYou && isCompleted) {
    return React.createElement('div', { className: 'survey-app' },
      React.createElement('div', { className: 'mode-indicator' }, `Mode: ${appMode}`),
      
      // Header for thank you screen
      React.createElement('header', { className: 'survey-header' },
        React.createElement('div', { className: 'header-content' },
          React.createElement('div', { className: 'header-brand' },
            React.createElement('img', { 
              src: './CAPTRS_StackedLogo_White_Square-01-01.png',
              alt: 'CAPTRS Logo',
              className: 'brand-logo'
            }),
            React.createElement('h1', { className: 'brand-title' }, survey?.title || 'CAPTRS Survey')
          ),
          React.createElement('div', { className: 'header-progress', 'aria-label': 'Survey progress' },
            React.createElement('div', { className: 'progress-step completed' }, 'W'),
            React.createElement('div', { className: 'progress-connector' }),
            React.createElement('div', { className: 'progress-step completed' }, '1'),
            React.createElement('div', { className: 'progress-connector' }),
            React.createElement('div', { className: 'progress-step completed' }, '2'),
            React.createElement('div', { className: 'progress-connector' }),
            React.createElement('div', { className: 'progress-step active' }, 'T')
          )
        )
      ),
      
      // Thank you content
      React.createElement('main', { 
        className: 'questions-container',
        style: { paddingTop: 'calc(var(--header-height) + var(--space-8))' }
      },
        React.createElement('div', { className: 'thank-you-screen' },
          React.createElement('h1', { className: 'survey-title' }, survey.thankYou.title),
          React.createElement('p', { className: 'thank-you-message' }, survey.thankYou.message),
          survey.settings?.branding && React.createElement('div', { className: 'branding' },
            survey.settings.branding.companyName && 
              React.createElement('div', { className: 'company-name' }, survey.settings.branding.companyName),
            survey.settings.branding.poweredBy && 
              React.createElement('div', { className: 'powered-by' }, survey.settings.branding.poweredBy)
          )
        )
      )
    );
  }

  // Get current section
  const currentSection = survey?.sections?.[currentSectionIndex];
  if (!currentSection) {
    return React.createElement('div', { className: 'error-message' },
      'Section not found. Please check the survey configuration.'
    );
  }

  const sectionProgress = createSectionProgress();

  // Main survey interface
  return React.createElement('div', { className: 'survey-app' },
    React.createElement('div', { className: 'mode-indicator' }, `Mode: ${appMode}`),
    
    // Header
    React.createElement(SurveyHeader, {
      survey,
      sectionProgress,
      appMode
    }),

    // Section Title Container (fixed positioned)
    React.createElement('div', { 
      className: 'section-title-container'
    },
      React.createElement('h2', { 
        className: 'fixed-section-title',
        id: 'section-title'
      }, `${currentSectionIndex + 1}. ${currentSection.title}`),
      currentSection.description && React.createElement('p', { 
        className: 'fixed-section-description' 
      }, currentSection.description)
    ),

    // Question Progress Bar
    React.createElement(SurveyProgress, {
      currentSection,
      answers,
      dynamicStyles
    }),

    // Questions Container
    React.createElement(SurveyQuestions, {
      currentSection,
      answers,
      onChange: handleAnswerChange,
      isSubmitting,
      dynamicStyles
    }),

    // Footer
    React.createElement(SurveyFooter, {
      currentSectionIndex,
      totalSections: survey.sections.length,
      canNavigateNext: canNavigateNext(),
      isSubmitting,
      onPrevious: handlePrevious,
      onNext: handleNext,
      onComplete: handleComplete
    })
  );
};
