import React from 'react';
import type { SurveyAppProps, Survey, SurveyAnswers, AppMode } from '../types/index.js';
import { usePerformanceTracking, useRenderCount, useMemoryUsage } from '../hooks/use-performance-tracking.js';
import { useDynamicPositioning } from '../utils/dynamic-positioning.js';
import { useSurveyValidation } from '../utils/survey-validation.js';
import { useAutoSave } from '../hooks/use-auto-save.js';
import { QuestionRenderer } from './question-renderer.js';
import { SurveyProgress } from './survey-progress.js';
import { QuestionProgress as QuestionProgressComponent } from './question-progress.js';

// Ensure React is available for browser environment
const ReactInstance = window.React || (window as any).React;

export const SurveyApp: React.FC<SurveyAppProps> = ({ apiProvider }) => {
    // Performance tracking
    usePerformanceTracking('SurveyApp');
    useRenderCount('SurveyApp');
    useMemoryUsage();
    
    // State management
    const [survey, setSurvey] = ReactInstance.useState(null as Survey | null);
    const [currentSectionIndex, setCurrentSectionIndex] = ReactInstance.useState(-1); // Start at -1 for welcome screen
    const [answers, setAnswers] = ReactInstance.useState({} as SurveyAnswers);
    const [isCompleted, setIsCompleted] = ReactInstance.useState(false);
    const [appMode, setAppMode] = ReactInstance.useState('loading' as AppMode);
    const [isSubmitting, setIsSubmitting] = ReactInstance.useState(false);
    const [error, setError] = ReactInstance.useState(null as string | null);

    const fileInputRef = ReactInstance.useRef(null as HTMLInputElement | null);

    // Custom hooks
    const dynamicStyles = useDynamicPositioning(currentSectionIndex);
    const { validateSurvey, validateAnswer } = useSurveyValidation();
    

    // Auto-save functionality
    const { loadSavedAnswers, clearSavedAnswers } = useAutoSave(survey?.id || null, answers);

    // Handle survey file upload
    const handleSurveyLoad = ReactInstance.useCallback((surveyData: Survey) => {
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

    // Process survey structure to handle sections
    const processSurveyStructure = ReactInstance.useCallback((surveyData: Survey): Survey => {
        if (!surveyData) {
            return surveyData;
        }
        
        // Keep the original structure with sections for the new layout
        if (surveyData.sections && Array.isArray(surveyData.sections)) {
            return surveyData;
        }
        
        // If survey has a flat questions array, convert to sections format
        if (surveyData.questions && Array.isArray(surveyData.questions)) {
            const result = {
                ...surveyData,
                sections: [{
                    id: 'main-section',
                    title: surveyData.title || 'Questions',
                    description: surveyData.description || '',
                    questions: surveyData.questions
                }]
            };
            return result;
        }
        
        return surveyData;
    }, []);

    // Handle file selection
    const handleFileSelect = ReactInstance.useCallback(async (file: File) => {
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
            handleSurveyLoad(surveyData as Survey);
        } catch (error) {
            console.error('Error loading survey file:', error);
            setError(`Failed to load survey: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }, [handleSurveyLoad]);

    // Handle file input change
    const handleFileInputChange = ReactInstance.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    }, [handleFileSelect]);

    // Trigger file input
    const triggerFileInput = ReactInstance.useCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, []);

    // Initialize app with API provider
    ReactInstance.useEffect(() => {
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
                        } else {
                            console.error('Survey validation failed:', validationResult.error);
                            setError(`Invalid survey configuration: ${validationResult.error}`);
                        }
                    } else {
                        console.warn('API provider callback received null/undefined surveyConfig');
                    }
                });

                // Send ready message to platform
                try {
                    window.parent.postMessage({
                        type: 'SURVEY_APP_READY',
                        message: 'Survey app is ready to receive configuration'
                    }, '*');
                } catch (error) {
                    console.error('Error sending message to parent:', error);
                }
                
                // Also try sending to top window if different from parent
                if (window.top && window.top !== window) {
                    try {
                        window.top.postMessage({
                            type: 'SURVEY_APP_READY',
                            message: 'Survey app is ready to receive configuration'
                        }, '*');
                    } catch (error) {
                        console.error('Error sending message to top window:', error);
                    }
                }
                
            } else {
                // Standalone mode - show file upload or sample survey
                setAppMode('standalone');
                // Don't auto-load sample survey, let user choose
            }
        } catch (error) {
            console.error('Error initializing survey app:', error);
            setError('Failed to initialize survey application');
        }
    }, [apiProvider, validateSurvey, processSurveyStructure]);

    const handleAnswerChange = ReactInstance.useCallback((questionId: string, value: any) => {
        setAnswers((prev: SurveyAnswers) => ({ ...prev, [questionId]: value }));
    }, []);

    const handleComplete = ReactInstance.useCallback(async () => {
        setIsSubmitting(true);
        
        try {
            // Clear saved answers on completion
            clearSavedAnswers();
            
            // Send completion data to platform
            if (appMode === 'platform') {
                const surveyData = {
                    surveyId: survey?.id,
                    answers,
                    timestamp: new Date().toISOString(),
                    sessionId: `session_${Date.now()}`
                };

                try {
                    // Try to save survey data to database using createAppData
                    await apiProvider.createAppData(surveyData);
                } catch (dbError) {
                    // Fallback to postMessage if database save fails
                    window.parent.postMessage({
                        type: 'SURVEY_COMPLETE',
                        data: surveyData
                    }, '*');
                }
            }
            
            setIsCompleted(true);
        } catch (error) {
            console.error('Error completing survey:', error);
            setError('Failed to submit survey responses');
        } finally {
            setIsSubmitting(false);
        }
    }, [appMode, survey?.id, answers, clearSavedAnswers, apiProvider]);

    // Navigation helpers
    const canNavigateNext = ReactInstance.useCallback(() => {
        const currentSection = survey?.sections?.[currentSectionIndex];
        if (!currentSection) return false;

        return currentSection.questions.every((q: any) => {
            const answer = answers[q.id];
            // For ranking questions, pass the total number of options to validate properly
            if (q.type === 'ranking') {
                const totalOptions = q.options?.length;
                const isValid = validateAnswer(answer, q.type, q.required, totalOptions);
                return isValid;
            }
            return validateAnswer(answer, q.type, q.required);
        });
    }, [survey, currentSectionIndex, answers, validateAnswer]);

    const handleNext = ReactInstance.useCallback(() => {
        if (currentSectionIndex < (survey?.sections?.length || 0) - 1) {
            const newIndex = currentSectionIndex + 1;
            setCurrentSectionIndex(newIndex);
            
            // Scroll to top of the new section and focus on section title
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                // Focus on the section title for better accessibility
                const sectionTitle = document.getElementById('section-title');
                if (sectionTitle) {
                    sectionTitle.focus();
                }
            }, 100);
        } else {
            handleComplete();
        }
    }, [currentSectionIndex, survey, handleComplete]);

    const handlePrevious = ReactInstance.useCallback(() => {
        const newIndex = Math.max(0, currentSectionIndex - 1);
        setCurrentSectionIndex(newIndex);
        
        // Scroll to top of the new section and focus on section title
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Focus on the section title for better accessibility
            const sectionTitle = document.getElementById('section-title');
            if (sectionTitle) {
                sectionTitle.focus();
            }
        }, 100);
    }, [currentSectionIndex]);

    // Question progress is now handled by the QuestionProgress component

    // Section progress is now handled by the SurveyProgress component

    // Show loading
    if (appMode === 'loading') {
        return ReactInstance.createElement('div', { className: 'loading' }, 'Loading survey...');
    }

    // Show error
    if (error) {
        return ReactInstance.createElement('div', { className: 'error-message' }, error);
    }

    // Show loading state for platform mode when survey is not yet loaded
    if (appMode === 'platform' && !survey) {
        return ReactInstance.createElement('div', { className: 'survey-app' },
            ReactInstance.createElement('div', { className: 'mode-indicator' }, `Mode: ${appMode}`),
            
            // Header for loading state
            ReactInstance.createElement('header', { className: 'survey-header' },
                ReactInstance.createElement('div', { className: 'header-content' },
                    ReactInstance.createElement('div', { className: 'header-brand' },
                        ReactInstance.createElement('h1', { className: 'brand-title' }, 'Loading Survey...')
                    )
                )
            ),
            
            // Loading content
            ReactInstance.createElement('main', { 
                className: 'questions-container',
                style: { paddingTop: 'calc(var(--header-height) + var(--space-8))' }
            },
                ReactInstance.createElement('div', { className: 'loading-state' },
                    ReactInstance.createElement('div', { className: 'loading-spinner' }, '⏳'),
                    ReactInstance.createElement('h2', { className: 'loading-title' }, 'Loading Survey Configuration'),
                    ReactInstance.createElement('p', { className: 'loading-message' }, 'Please wait while we load your survey...')
                )
            )
        );
    }

    // Show standalone mode with file upload options
    if (appMode === 'standalone' && !survey) {
        return ReactInstance.createElement('div', { className: 'survey-app' },
            ReactInstance.createElement('div', { className: 'mode-indicator' }, `Mode: ${appMode}`),
            
            // Hidden file input
            ReactInstance.createElement('input', {
                ref: fileInputRef,
                type: 'file',
                accept: '.json,application/json',
                onChange: handleFileInputChange,
                style: { display: 'none' }
            }),
            
            // Header for standalone mode
            ReactInstance.createElement('header', { className: 'survey-header' },
                ReactInstance.createElement('div', { className: 'header-content' },
                    ReactInstance.createElement('div', { className: 'header-brand' },
                        ReactInstance.createElement('h1', { className: 'brand-title' }, 'Standalone Survey Taker App')
                    )
                )
            ),
            
            // Standalone content
            ReactInstance.createElement('main', { 
                className: 'questions-container',
                style: { paddingTop: 'calc(var(--header-height) + var(--space-8))' }
            },
                ReactInstance.createElement('div', { className: 'standalone-mode' },
                    ReactInstance.createElement('div', { className: 'standalone-header' },
                        ReactInstance.createElement('h1', { className: 'standalone-title' }, 'Standalone Survey Taker App')
                    ),
                    ReactInstance.createElement('div', { className: 'standalone-actions' },
                        ReactInstance.createElement('button', {
                            onClick: triggerFileInput,
                            className: 'button button--primary',
                            'aria-label': 'Upload survey file'
                        }, 'Upload Survey File')
                    ),
                    error && ReactInstance.createElement('div', { className: 'file-upload-error' },
                        ReactInstance.createElement('span', { className: 'error-icon', 'aria-hidden': 'true' }, '⚠️'),
                        ReactInstance.createElement('div', null, error)
                    )
                )
            )
        );
    }

    // Show welcome screen - this must come BEFORE section rendering logic
    if (currentSectionIndex === -1 && survey) {
        
        return ReactInstance.createElement('div', { className: 'survey-app' },
            ReactInstance.createElement('div', { className: 'mode-indicator' }, `Mode: ${appMode}`),
            
            // Header for welcome screen
            ReactInstance.createElement('header', { className: 'survey-header' },
                ReactInstance.createElement('div', { className: 'header-content' },
                    ReactInstance.createElement('div', { className: 'header-brand' },
                        ReactInstance.createElement('h1', { className: 'brand-title' }, survey.title || 'CAPTRS Survey')
                    ),
                    ReactInstance.createElement(SurveyProgress, {
                        survey,
                        currentSectionIndex,
                        isCompleted
                    })
                )
            ),
            
            // Welcome content
            ReactInstance.createElement('main', { 
                className: 'questions-container',
                style: { paddingTop: 'calc(var(--header-height) + var(--space-8))' }
            },
                ReactInstance.createElement('div', { className: 'welcome-screen' },
                    survey.welcome ? (
                        // Show welcome content if available
                        ReactInstance.createElement(ReactInstance.Fragment, null,
                            ReactInstance.createElement('h1', { className: 'survey-title' }, survey.welcome.title),
                            ReactInstance.createElement('p', { className: 'welcome-message' }, survey.welcome.message)
                        )
                    ) : (
                        // Show default welcome if no welcome property
                        ReactInstance.createElement(ReactInstance.Fragment, null,
                            ReactInstance.createElement('h1', { className: 'survey-title' }, 'Welcome to the Survey'),
                            ReactInstance.createElement('p', { className: 'welcome-message' }, 'Click the button below to begin.')
                        )
                    ),
                    ReactInstance.createElement('button', {
                        onClick: () => {
                            setCurrentSectionIndex(0);
                            
                            // Scroll to top when starting the survey and focus on section title
                            setTimeout(() => {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                
                                // Focus on the section title for better accessibility
                                const sectionTitle = document.getElementById('section-title');
                                if (sectionTitle) {
                                    sectionTitle.focus();
                                }
                            }, 100);
                        },
                        className: 'button button--primary button--lg',
                        style: { marginTop: 'var(--space-8)' }
                    }, 'Start Survey'),
                    survey.settings?.branding && ReactInstance.createElement('div', { className: 'branding' },
                        survey.settings.branding.companyName && 
                            ReactInstance.createElement('div', { className: 'company-name' }, survey.settings.branding.companyName),
                        survey.settings.branding.poweredBy && 
                            ReactInstance.createElement('div', { className: 'powered-by' }, survey.settings.branding.poweredBy)
                    )
                )
            )
        );
    }

    // Show thank you screen
    if (survey?.thankYou && isCompleted) {
        
        return ReactInstance.createElement('div', { className: 'survey-app' },
            ReactInstance.createElement('div', { className: 'mode-indicator' }, `Mode: ${appMode}`),
            
            // Header for thank you screen
            ReactInstance.createElement('header', { className: 'survey-header' },
                ReactInstance.createElement('div', { className: 'header-content' },
                    ReactInstance.createElement('div', { className: 'header-brand' },
                        ReactInstance.createElement('h1', { className: 'brand-title' }, survey?.title || 'CAPTRS Survey')
                    ),
                    ReactInstance.createElement(SurveyProgress, {
                        survey,
                        currentSectionIndex,
                        isCompleted
                    })
                )
            ),
            
            // Thank you content
            ReactInstance.createElement('main', { 
                className: 'questions-container',
                style: { paddingTop: 'calc(var(--header-height) + var(--space-8))' }
            },
                ReactInstance.createElement('div', { className: 'thank-you-screen' },
                    ReactInstance.createElement('h1', { className: 'survey-title' }, survey.thankYou.title),
                    ReactInstance.createElement('p', { className: 'thank-you-message' }, survey.thankYou.message),
                    survey.settings?.branding && ReactInstance.createElement('div', { className: 'branding' },
                        survey.settings.branding.companyName && 
                            ReactInstance.createElement('div', { className: 'company-name' }, survey.settings.branding.companyName),
                        survey.settings.branding.poweredBy && 
                            ReactInstance.createElement('div', { className: 'powered-by' }, survey.settings.branding.poweredBy)
                    )
                )
            )
        );
    }

    // Get current section
    
    // Check if survey is still loading (platform mode)
    if (appMode === 'platform' && !survey) {
        return ReactInstance.createElement('div', { className: 'loading-state' },
            ReactInstance.createElement('div', { className: 'loading-spinner' }),
            ReactInstance.createElement('p', null, 'Loading survey configuration...')
        );
    }
    
    const currentSection = survey?.sections?.[currentSectionIndex];
    if (!currentSection) {
        return ReactInstance.createElement('div', { className: 'error-message' },
            'Section not found. Please check the survey configuration.'
        );
    }

    const isLastSection = currentSectionIndex === (survey?.sections?.length || 0) - 1;

    // Main survey interface
    return ReactInstance.createElement('div', { className: 'survey-app' },
        ReactInstance.createElement('div', { className: 'mode-indicator' }, `Mode: ${appMode}`),
        
        // Header (fixed positioned)
        ReactInstance.createElement('header', { 
            className: 'survey-header'
        },
            ReactInstance.createElement('div', { className: 'header-content' },
                ReactInstance.createElement('div', { className: 'header-brand' },
                    ReactInstance.createElement('h1', { className: 'brand-title' }, survey?.title || 'CAPTRS Survey')
                ),
                ReactInstance.createElement(SurveyProgress, {
                    survey,
                    currentSectionIndex,
                    isCompleted
                })
            )
        ),

        // Section Title Container (fixed positioned)
        ReactInstance.createElement('div', { 
            className: 'section-title-container'
        },
            ReactInstance.createElement('h2', { 
                className: 'fixed-section-title',
                id: 'section-title',
                tabIndex: 0
            }, `${currentSectionIndex + 1}. ${currentSection.title}`),
            currentSection.description && ReactInstance.createElement('p', { 
                className: 'fixed-section-description' 
            }, currentSection.description)
        ),

        // Question Progress Bar (fixed positioned)
        ReactInstance.createElement(QuestionProgressComponent, {
            currentSection,
            answers,
            dynamicStyles
        }),

        // Questions Container
        ReactInstance.createElement('main', { 
            className: `questions-container ${currentSection.questions.length === 0 ? 'no-progress' : ''}`,
            style: { paddingTop: dynamicStyles.questionsPaddingTop }
        },
            ReactInstance.createElement('div', { className: 'questions-section' },
                currentSection.questions.map((question: any, index: number) =>
                    ReactInstance.createElement('div', { 
                        key: question.id, 
                        className: 'question-card'
                    },
                        ReactInstance.createElement('div', { className: 'question-header' },
                            ReactInstance.createElement('div', { 
                                className: 'question-number',
                                'aria-hidden': 'true'
                            }, index + 1),
                            ReactInstance.createElement('div', { className: 'question-content' },
                                ReactInstance.createElement('h3', { 
                                    className: 'question-text',
                                    id: `${question.id}-label`
                                },
                                    question.question,
                                    question.required && ReactInstance.createElement('span', { 
                                        className: 'question-required',
                                        'aria-label': 'required'
                                    }, '*')
                                )
                            )
                        ),
                        ReactInstance.createElement(QuestionRenderer, {
                            question,
                            answer: answers[question.id],
                            onChange: handleAnswerChange,
                            disabled: isSubmitting
                        })
                    )
                )
            )
        ),

        // Footer (fixed positioned)
        ReactInstance.createElement('footer', { className: 'survey-footer' },
            ReactInstance.createElement('div', { className: 'footer-section' },
                ReactInstance.createElement('button', {
                    onClick: handlePrevious,
                    disabled: currentSectionIndex === 0 || isSubmitting,
                    className: 'button button--secondary',
                    'aria-label': 'Go to previous section'
                },
                    ReactInstance.createElement('span', { 'aria-hidden': 'true' }, '←'),
                    'Back'
                )
            ),
            ReactInstance.createElement('div', { className: 'footer-center' },
                ReactInstance.createElement('div', { className: 'footer-icon', 'aria-hidden': 'true' },
                    ReactInstance.createElement('img', {
                        src: './captrs-icon-blue.svg',
                        alt: 'CAPTRS icon',
                        className: 'captrs-icon'
                    })
                )
            ),
            ReactInstance.createElement('div', { className: 'footer-section' },
                ReactInstance.createElement('button', {
                    onClick: isLastSection ? handleComplete : handleNext,
                    disabled: !canNavigateNext() || isSubmitting,
                    className: `button button--primary ${isSubmitting ? 'button--loading' : ''}`,
                    'aria-label': isLastSection ? 'Complete survey' : 'Go to next section'
                },
                    isLastSection ? 'Complete Survey' : 'Next',
                    ReactInstance.createElement('span', { 'aria-hidden': 'true' }, '→')
                )
            )
        )
    );
};
