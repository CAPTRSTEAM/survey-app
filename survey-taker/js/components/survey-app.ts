import React from 'react';
import { useApi, AddEventDTOType } from 'spa-api-provider';
import type { SurveyAppProps, Survey, SurveyAnswers, AppMode } from '../types/index.js';
import { useDynamicPositioning } from '../utils/dynamic-positioning.js';
import { useSurveyValidation } from '../utils/survey-validation.js';
import { useAutoSave } from '../hooks/use-auto-save.js';
import { QuestionRenderer } from './question-renderer.js';
import { SurveyProgress } from './survey-progress.js';
import { QuestionProgress as QuestionProgressComponent } from './question-progress.js';

// Ensure React is available for browser environment
const ReactInstance = window.React || (window as any).React;

const SURVEY_LOOKUP_PATHS = [
    'survey',
    'surveyConfig',
    'gameConfig.survey',
    'gameConfig.surveyConfig',
    'appConfig.survey',
    'appConfig.surveyConfig',
    'configuration.survey',
    'configuration.surveyConfig',
    'data.survey',
    'data.surveyConfig',
    'gameConfig',
    'appConfig',
    'configuration',
    'data',
    'config',
    'surveyDefinition'
];

function getNestedValue(obj: any, path: string) {
    try {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    } catch (error) {
        console.error('Error accessing nested value:', error);
        return null;
    }
}

function isValidSurveyCandidate(obj: any): obj is Survey {
    if (!obj || typeof obj !== 'object') {
        return false;
    }

    const hasQuestions = Array.isArray(obj.questions) && obj.questions.length > 0;
    const hasSections = Array.isArray(obj.sections) && obj.sections.length > 0;
    const hasStructure = Boolean(obj.id && obj.title && (obj.welcome || obj.thankYou));

    return hasQuestions || hasSections || hasStructure;
}

function extractSurveyFromData(data: any): Survey | null {
    if (isValidSurveyCandidate(data)) {
        return data;
    }

    for (const path of SURVEY_LOOKUP_PATHS) {
        const candidate = getNestedValue(data, path);
        if (candidate && isValidSurveyCandidate(candidate)) {
            return candidate;
        }
    }

    return null;
}

export const SurveyApp: React.FC<SurveyAppProps> = ({ platformConfig }) => {
    // Performance tracking disabled to prevent browser crashes
    
    const {
        providerConfig,
        updateProviderConfig,
        createAppData,
        addEvent,
        appConfig,
        closeApp
    } = useApi();

    // State management
    const [survey, setSurvey] = ReactInstance.useState(null as Survey | null);
    const [currentSectionIndex, setCurrentSectionIndex] = ReactInstance.useState(-1); // Start at -1 for welcome screen
    const [answers, setAnswers] = ReactInstance.useState({} as SurveyAnswers);
    const [isCompleted, setIsCompleted] = ReactInstance.useState(false);
    const [appMode, setAppMode] = ReactInstance.useState('loading' as AppMode);
    const [isSubmitting, setIsSubmitting] = ReactInstance.useState(false);
    const [error, setError] = ReactInstance.useState(null as string | null);
    const [isTimeoutError, setIsTimeoutError] = ReactInstance.useState(false);
    const [surveyStartTime, setSurveyStartTime] = ReactInstance.useState(null as number | null);
    const platformConfigState = ReactInstance.useState(platformConfig ?? null);
    const resolvedPlatformConfig = platformConfigState[0] as SurveyAppProps['platformConfig'];
    const setResolvedPlatformConfig = platformConfigState[1] as (config: SurveyAppProps['platformConfig']) => void;

    const fileInputRef = ReactInstance.useRef(null as HTMLInputElement | null);
    const hasAnnouncedReadyRef = ReactInstance.useRef(false);

    // Custom hooks
    const dynamicStyles = useDynamicPositioning(currentSectionIndex);
    const { validateSurvey, validateAnswer } = useSurveyValidation();
    

    // Auto-save functionality
    const { loadSavedAnswers, clearSavedAnswers } = useAutoSave(survey?.id || null, answers);

    // Handle retry after timeout
    const handleRetry = ReactInstance.useCallback(() => {
        setIsTimeoutError(false);
        setError(null);
        setAppMode('loading');

        if (providerConfig?.apiUrl && providerConfig?.token) {
            try {
                updateProviderConfig(providerConfig.apiUrl, providerConfig.token);
            } catch (retryError) {
                console.error('Failed to refresh provider configuration:', retryError);
            }
        }
    }, [providerConfig, updateProviderConfig]);

    // Handle quit after timeout
    const handleQuit = ReactInstance.useCallback(() => {
        // Close the window or navigate away
        try {
            closeApp();
        } catch (error) {
            console.warn('Failed to invoke closeApp via provider:', error);
        }

        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'CLOSE_APP' }, '*');
        } else {
            window.close();
        }
    }, [closeApp]);

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

    ReactInstance.useEffect(() => {
        setResolvedPlatformConfig(platformConfig ?? null);
    }, [platformConfig]);

    ReactInstance.useEffect(() => {
        const embedded = window.parent && window.parent !== window;

        if (embedded || resolvedPlatformConfig || providerConfig) {
            if (isTimeoutError) {
                setIsTimeoutError(false);
            }
            setAppMode('platform');
        } else if (!isTimeoutError && appMode !== 'error') {
            setAppMode('standalone');
        }
    }, [resolvedPlatformConfig, providerConfig, isTimeoutError, appMode]);

    ReactInstance.useEffect(() => {
        if (appMode !== 'platform') {
            return;
        }

        if (hasAnnouncedReadyRef.current) {
            return;
        }

        try {
            window.parent?.postMessage({
                type: 'SURVEY_APP_READY',
                message: 'Survey app is ready to receive configuration'
            }, '*');
        } catch (messageError) {
            console.error('Error sending message to parent window:', messageError);
        }

        if (window.top && window.top !== window) {
            try {
                window.top.postMessage({
                    type: 'SURVEY_APP_READY',
                    message: 'Survey app is ready to receive configuration'
                }, '*');
            } catch (topError) {
                console.error('Error sending message to top window:', topError);
            }
        }

        hasAnnouncedReadyRef.current = true;
    }, [appMode]);

    ReactInstance.useEffect(() => {
        if (appMode !== 'platform' || survey) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setIsTimeoutError(true);
            setAppMode('error');
        }, 15000);

        return () => window.clearTimeout(timeoutId);
    }, [appMode, survey]);

    const processSurveyFromSource = ReactInstance.useCallback((source: any, sourceName: string) => {
        if (!source) {
            return false;
        }

        const extractedSurvey = extractSurveyFromData(source);

        if (!extractedSurvey) {
            return false;
        }

        if (survey && extractedSurvey.id && survey.id === extractedSurvey.id) {
            return true;
        }

        const validationResult = validateSurvey(extractedSurvey);

        if (!validationResult.isValid) {
            console.error(`Survey validation failed for ${sourceName}:`, validationResult.error);
            setError(`Invalid survey configuration: ${validationResult.error}`);
            return false;
        }

        const processedSurvey = processSurveyStructure(extractedSurvey);
        setSurvey(processedSurvey);
        setError(null);
        setAppMode('platform');
        return true;
    }, [survey, validateSurvey, processSurveyStructure]);

    ReactInstance.useEffect(() => {
        if (appMode !== 'platform') {
            return;
        }

        const sources: Array<[any, string]> = [
            [resolvedPlatformConfig?.survey, 'platformConfig.survey'],
            [resolvedPlatformConfig?.surveyConfig, 'platformConfig.surveyConfig'],
            [resolvedPlatformConfig, 'platformConfig'],
            [appConfig, 'appConfig']
        ];

        for (const [source, sourceName] of sources) {
            if (processSurveyFromSource(source, sourceName)) {
                return;
            }
        }
    }, [appMode, resolvedPlatformConfig, appConfig, processSurveyFromSource]);

    const handleAnswerChange = ReactInstance.useCallback((questionId: string, value: any) => {
        setAnswers((prev: SurveyAnswers) => ({ ...prev, [questionId]: value }));
    }, []);

    const handleComplete = ReactInstance.useCallback(async () => {
        setIsSubmitting(true);
        
        try {
            clearSavedAnswers();
            
            if (appMode === 'platform') {
                const timeSpent = surveyStartTime ? Math.round((Date.now() - surveyStartTime) / 1000) : 0;
                const timestamp = new Date().toISOString();
                const sessionId = `session_${Date.now()}`;

                const exerciseId = (resolvedPlatformConfig?.exerciseId as string)
                    ?? (getNestedValue(appConfig, 'exerciseId') as string)
                    ?? 'public-survey';
                const appInstanceId = (resolvedPlatformConfig?.appInstanceId as string)
                    ?? (getNestedValue(appConfig, 'appInstanceId') as string)
                    ?? (getNestedValue(appConfig, 'gameConfigId') as string)
                    ?? survey?.id
                    ?? 'public-survey-instance';
                const organizationId = (resolvedPlatformConfig?.organizationId as string)
                    ?? exerciseId;

                const surveyPayload = {
                    surveyId: survey?.id,
                    surveyTitle: survey?.title,
                    surveyDescription: survey?.description,
                    surveyStructure: survey ? {
                        welcome: survey.welcome,
                        thankYou: survey.thankYou,
                        settings: survey.settings,
                        sections: survey.sections
                    } : null,
                    answers,
                    timestamp,
                    sessionId,
                    timeSpent
                };

                const payload = {
                    exerciseId,
                    gameConfigId: appInstanceId,
                    organizationId,
                    data: JSON.stringify({
                        ...surveyPayload,
                        completedAt: new Date().toISOString(),
                        status: 'completed',
                        type: 'survey-completion'
                    })
                };

                try {
                    await createAppData(JSON.stringify(payload));

                    try {
                        await addEvent({
                            type: AddEventDTOType.APP_FINISH,
                            data: JSON.stringify({
                                appInstanceId,
                                exerciseId,
                                completedAt: new Date().toISOString(),
                                status: 'completed'
                            })
                        });
                    } catch (eventError) {
                        console.warn('Failed to send APP_FINISH event:', eventError);
                    }
                } catch (dbError) {
                    console.error('Error saving survey data through spa-api-provider:', dbError);
                    window.parent.postMessage({
                        type: 'SURVEY_COMPLETE',
                        data: surveyPayload
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
    }, [appMode, survey, answers, clearSavedAnswers, surveyStartTime, resolvedPlatformConfig, appConfig, createAppData, addEvent]);

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

    // Show timeout error
    if (isTimeoutError) {
        return ReactInstance.createElement('div', { className: 'survey-app' },
            ReactInstance.createElement('div', { className: 'timeout-error' }, 
                ReactInstance.createElement('div', { className: 'timeout-icon' }, '⏱️'),
                ReactInstance.createElement('h2', null, 'Connection Timeout'),
                ReactInstance.createElement('p', null, 'The survey failed to load within the expected time. This could be due to a slow connection or server issues.'),
                ReactInstance.createElement('div', { className: 'timeout-actions' },
                    ReactInstance.createElement('button', {
                        onClick: handleRetry,
                        className: 'button button--primary',
                        style: { marginRight: 'var(--space-3)' }
                    }, 'Try Again'),
                    ReactInstance.createElement('button', {
                        onClick: handleQuit,
                        className: 'button button--secondary'
                    }, 'Quit')
                ),
                ReactInstance.createElement('p', { className: 'timeout-help' }, 
                    'If this problem persists, please check your internet connection and try again.'
                )
            )
        );
    }

    // Show error
    if (error) {
        return ReactInstance.createElement('div', { className: 'survey-app' },
            ReactInstance.createElement('div', { className: 'error-message' }, 
                ReactInstance.createElement('h2', null, 'Configuration Error'),
                ReactInstance.createElement('p', null, error),
                ReactInstance.createElement('p', null, 'The survey will load with sample data for testing purposes.'),
                ReactInstance.createElement('button', {
                    onClick: () => {
                        setError(null);
                        // Try to load sample survey
                        const sampleSurvey = {
                            "id": "sample-survey-001",
                            "title": "Sample Survey",
                            "description": "This is a sample survey for testing purposes.",
                            "sections": [{
                                "id": "sample-section",
                                "title": "Sample Questions",
                                "description": "Please answer these sample questions.",
                                "questions": [{
                                    "id": "q1",
                                    "type": "text",
                                    "question": "What is your feedback?",
                                    "required": false
                                }]
                            }]
                        };
                        handleSurveyLoad(sampleSurvey);
                    },
                    className: 'button button--primary',
                    style: { marginTop: 'var(--space-4)' }
                }, 'Load Sample Survey')
            )
        );
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
                            // Start timing when user begins the survey
                            setSurveyStartTime(Date.now());
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
                    ReactInstance.createElement('button', {
                        onClick: () => {
                            try {
                                closeApp();
                            } catch (error) {
                                console.warn('Failed to invoke closeApp via provider:', error);
                                if (window.parent && window.parent !== window) {
                                    window.parent.postMessage({ type: 'CLOSE_APP' }, '*');
                                } else {
                                    window.close();
                                }
                            }
                        },
                        className: 'button button--primary',
                        style: { marginTop: 'var(--space-6)' },
                        'aria-label': 'Close the survey'
                    }, 'Close App'),
                    survey.settings?.branding && ReactInstance.createElement('div', { className: 'branding' },
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
