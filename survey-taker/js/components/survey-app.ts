import type { SurveyAppProps, Survey, SurveyAnswers, AppMode } from '../types/index.js';
import { React } from '../utils/react-wrapper.js';
import { QuestionRenderer } from './question-renderer.js';
import { SurveyProgress } from './survey-progress.js';
import { QuestionProgress as QuestionProgressComponent } from './question-progress.js';
import { useDynamicPositioning } from '../utils/dynamic-positioning.js';
import { useSurveyValidation } from '../utils/survey-validation.js';
import { useAutoSave } from '../hooks/use-auto-save.js';
import { usePerformanceTracking, useRenderCount, useMemoryUsage } from '../hooks/use-performance-tracking.js';

export const SurveyApp: React.FC<SurveyAppProps> = ({ apiProvider }) => {
    console.log('🔍 SurveyApp component STARTING...');
    console.log('🔍 SurveyApp component rendered with apiProvider:', apiProvider);
    
    // Performance tracking
    usePerformanceTracking('SurveyApp');
    useRenderCount('SurveyApp');
    useMemoryUsage();
    
    // State management
    const [survey, setSurvey] = React.useState(null as Survey | null);
    const [currentSectionIndex, setCurrentSectionIndex] = React.useState(-1); // Start at -1 for welcome screen
    const [answers, setAnswers] = React.useState({} as SurveyAnswers);
    const [isCompleted, setIsCompleted] = React.useState(false);
    const [appMode, setAppMode] = React.useState('loading' as AppMode);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState(null as string | null);

    const fileInputRef = React.useRef(null as HTMLInputElement | null);

    console.log('🔍 SurveyApp state:', { survey, currentSectionIndex, answers, isCompleted, appMode, error });

    // Custom hooks
    const dynamicStyles = useDynamicPositioning(currentSectionIndex);
    const { validateSurvey, validateAnswer } = useSurveyValidation();
    
    // Auto-save functionality
    const { loadSavedAnswers, clearSavedAnswers } = useAutoSave(survey?.id || null, answers);

    // Handle survey file upload
    const handleSurveyLoad = React.useCallback((surveyData: Survey) => {
        console.log('🔍 handleSurveyLoad called with:', surveyData);
        try {
            // Validate survey structure
            const validationResult = validateSurvey(surveyData);
            if (validationResult.isValid) {
                const processedSurvey = processSurveyStructure(surveyData);
                console.log('🔍 Setting survey to:', processedSurvey);
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
    const processSurveyStructure = React.useCallback((surveyData: Survey): Survey => {
        console.log('🔍 processSurveyStructure called with:', surveyData);
        if (!surveyData) return surveyData;
        
        // Keep the original structure with sections for the new layout
        if (surveyData.sections && Array.isArray(surveyData.sections)) {
            console.log('🔍 Survey already has sections, returning as-is');
            return surveyData;
        }
        
        // If survey has a flat questions array, convert to sections format
        if (surveyData.questions && Array.isArray(surveyData.questions)) {
            console.log('🔍 Converting flat questions to sections format');
            return {
                ...surveyData,
                sections: [{
                    id: 'main-section',
                    title: surveyData.title || 'Questions',
                    description: surveyData.description || '',
                    questions: surveyData.questions
                }]
            };
        }
        
        return surveyData;
    }, []);

    // Handle file selection
    const handleFileSelect = React.useCallback(async (file: File) => {
        console.log('🔍 handleFileSelect called with file:', file);
        if (!file) return;

        // Validate file type
        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
            setError('Please select a valid JSON file');
            return;
        }

        try {
            const text = await file.text();
            const surveyData = JSON.parse(text);
            console.log('🔍 Parsed survey data:', surveyData);

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
    const handleFileInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('🔍 handleFileInputChange called with:', e.target.files?.[0]);
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    }, [handleFileSelect]);

    // Trigger file input
    const triggerFileInput = React.useCallback(() => {
        console.log('🔍 triggerFileInput called');
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, []);

    // Initialize app with API provider
    React.useEffect(() => {
        console.log('🔍 useEffect for API provider called');
        try {
            // Check if running in iframe (platform mode)
            if (window.parent !== window) {
                console.log('🔍 Setting appMode to platform');
                setAppMode('platform');
                
                // Subscribe to API provider updates
                apiProvider.subscribe((surveyConfig) => {
                    console.log('🔍 API provider subscription callback with:', surveyConfig);
                    if (surveyConfig) {
                        // Validate survey structure
                        const validationResult = validateSurvey(surveyConfig);
                        if (validationResult.isValid) {
                            const processedSurvey = processSurveyStructure(surveyConfig);
                            setSurvey(processedSurvey);
                            setError(null);
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
                console.log('🔍 Setting appMode to standalone');
                setAppMode('standalone');
                // Don't auto-load sample survey, let user choose
            }
        } catch (error) {
            console.error('Error initializing survey app:', error);
            setError('Failed to initialize survey application');
        }
    }, [apiProvider, validateSurvey, processSurveyStructure]);

    const handleAnswerChange = React.useCallback((questionId: string, value: any) => {
        console.log('🔍 handleAnswerChange called:', { questionId, value });
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    }, []);

    const handleComplete = React.useCallback(async () => {
        console.log('🔍 handleComplete called');
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
    }, [appMode, survey?.id, answers, clearSavedAnswers]);

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
        console.log('🔍 handleNext called, currentSectionIndex:', currentSectionIndex);
        if (currentSectionIndex < (survey?.sections?.length || 0) - 1) {
            const newIndex = currentSectionIndex + 1;
            console.log('🔍 Setting currentSectionIndex to:', newIndex);
            setCurrentSectionIndex(newIndex);
        } else {
            handleComplete();
        }
    }, [currentSectionIndex, survey, handleComplete]);

    const handlePrevious = React.useCallback(() => {
        console.log('🔍 handlePrevious called, currentSectionIndex:', currentSectionIndex);
        const newIndex = Math.max(0, currentSectionIndex - 1);
        console.log('🔍 Setting currentSectionIndex to:', newIndex);
        setCurrentSectionIndex(newIndex);
    }, [currentSectionIndex]);

    // Question progress is now handled by the QuestionProgress component

    // Section progress is now handled by the SurveyProgress component

    // Show loading
    if (appMode === 'loading') {
        console.log('🔍 Rendering loading screen');
        return React.createElement('div', { className: 'loading' }, 'Loading survey...');
    }

    // Show error
    if (error) {
        console.log('🔍 Rendering error screen:', error);
        return React.createElement('div', { className: 'error-message' }, error);
    }

    // Show standalone mode with file upload options
    if (appMode === 'standalone' && !survey) {
        console.log('🔍 Rendering standalone mode with file upload');
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
        console.log('🔍 Rendering welcome screen');
        
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
                    React.createElement(SurveyProgress, {
                        survey,
                        currentSectionIndex,
                        isCompleted
                    })
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
                        onClick: () => {
                            console.log('🔍 Start Survey button clicked!');
                            console.log('🔍 Setting currentSectionIndex from -1 to 0');
                            setCurrentSectionIndex(0);
                        },
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
        console.log('🔍 Rendering thank you screen');
        
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
                    React.createElement(SurveyProgress, {
                        survey,
                        currentSectionIndex,
                        isCompleted
                    })
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
        console.log('🔍 Current section not found, rendering error');
        return React.createElement('div', { className: 'error-message' },
            'Section not found. Please check the survey configuration.'
        );
    }

    const isLastSection = currentSectionIndex === (survey?.sections?.length || 0) - 1;

    // Main survey interface
    console.log('🔍 Rendering main survey interface');
    return React.createElement('div', { className: 'survey-app' },
        React.createElement('div', { className: 'mode-indicator' }, `Mode: ${appMode}`),
        
        // Header (fixed positioned)
        React.createElement('header', { 
            className: 'survey-header'
        },
            React.createElement('div', { className: 'header-content' },
                React.createElement('div', { className: 'header-brand' },
                    React.createElement('img', { 
                        src: './CAPTRS_StackedLogo_White_Square-01-01.png',
                        alt: 'CAPTRS Logo',
                        className: 'brand-logo'
                    }),
                    React.createElement('h1', { className: 'brand-title' }, survey?.title || 'CAPTRS Survey')
                ),
                React.createElement(SurveyProgress, {
                    survey,
                    currentSectionIndex,
                    isCompleted
                })
            )
        ),

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

        // Question Progress Bar (fixed positioned)
        React.createElement(QuestionProgressComponent, {
            currentSection,
            answers,
            dynamicStyles
        }),

        // Questions Container
        React.createElement('main', { 
            className: `questions-container ${currentSection.questions.length === 0 ? 'no-progress' : ''}`,
            style: { paddingTop: dynamicStyles.questionsPaddingTop }
        },
            React.createElement('div', { className: 'questions-section' },
                currentSection.questions.map((question, index) =>
                    React.createElement('div', { 
                        key: question.id, 
                        className: 'question-card'
                    },
                        React.createElement('div', { className: 'question-header' },
                            React.createElement('div', { 
                                className: 'question-number',
                                'aria-hidden': 'true'
                            }, index + 1),
                            React.createElement('div', { className: 'question-content' },
                                React.createElement('h3', { 
                                    className: 'question-text',
                                    id: `${question.id}-label`
                                },
                                    question.question,
                                    question.required && React.createElement('span', { 
                                        className: 'question-required',
                                        'aria-label': 'required'
                                    }, '*')
                                )
                            )
                        ),
                        React.createElement(QuestionRenderer, {
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
        React.createElement('footer', { className: 'survey-footer' },
            React.createElement('div', { className: 'footer-section' },
                React.createElement('button', {
                    onClick: handlePrevious,
                    disabled: currentSectionIndex === 0 || isSubmitting,
                    className: 'button button--secondary',
                    'aria-label': 'Go to previous section'
                },
                    React.createElement('span', { 'aria-hidden': 'true' }, '←'),
                    'Back'
                )
            ),
            React.createElement('div', { className: 'footer-center' },
                React.createElement('div', { className: 'footer-icon', 'aria-hidden': 'true' }, '✅')
            ),
            React.createElement('div', { className: 'footer-section' },
                React.createElement('button', {
                    onClick: isLastSection ? handleComplete : handleNext,
                    disabled: !canNavigateNext() || isSubmitting,
                    className: `button button--primary ${isSubmitting ? 'button--loading' : ''}`,
                    'aria-label': isLastSection ? 'Complete survey' : 'Go to next section'
                },
                    isLastSection ? 'Complete Survey' : 'Next',
                    React.createElement('span', { 'aria-hidden': 'true' }, '→')
                )
            )
        )
    );
};
