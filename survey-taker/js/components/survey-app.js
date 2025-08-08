// Main Survey App Component
const React = window.React;
import { QuestionRenderer } from './question-renderer.js';
import { useDynamicPositioning } from '../utils/dynamic-positioning.js';
import { useSurveyValidation } from '../utils/survey-validation.js';

export const SurveyApp = ({ apiProvider }) => {
    const [survey, setSurvey] = React.useState(null);
    const [currentSectionIndex, setCurrentSectionIndex] = React.useState(-1); // Start at -1 for welcome screen
    const [answers, setAnswers] = React.useState({});
    const [isCompleted, setIsCompleted] = React.useState(false);
    const [appMode, setAppMode] = React.useState('loading');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState(null);

    // Custom hooks
    const dynamicStyles = useDynamicPositioning(currentSectionIndex);
    const { validateSurvey, validateAnswer } = useSurveyValidation();

    // Initialize app with API provider
    React.useEffect(() => {
        try {
            // Check if running in iframe (platform mode)
            if (window.parent !== window) {
                setAppMode('platform');
                
                // Subscribe to API provider updates
                apiProvider.subscribe((surveyConfig) => {
                    console.log('Survey config received from API provider:', surveyConfig);
                    
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
                // Standalone mode - load sample survey
                setAppMode('standalone');
                const sampleSurvey = apiProvider.getSampleSurvey();
                const processedSurvey = processSurveyStructure(sampleSurvey);
                setSurvey(processedSurvey);
            }
        } catch (error) {
            console.error('Error initializing survey app:', error);
            setError('Failed to initialize survey application');
        }
    }, [apiProvider, validateSurvey]);

    // Process survey structure to handle sections
    const processSurveyStructure = (surveyData) => {
        if (!surveyData) return null;
        
        // Keep the original structure with sections for the new layout
        if (surveyData.sections && Array.isArray(surveyData.sections)) {
            return surveyData;
        }
        
        // If survey has a flat questions array, convert to sections format
        if (surveyData.questions && Array.isArray(surveyData.questions)) {
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
    };

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleComplete = async () => {
        setIsSubmitting(true);
        
        try {
            // Send completion data to platform
            if (appMode === 'platform') {
                window.parent.postMessage({
                    type: 'SURVEY_COMPLETE',
                    data: {
                        surveyId: survey.id,
                        answers,
                        timestamp: new Date().toISOString(),
                        sessionId: `session_${Date.now()}`
                    }
                }, '*');
            }
            
            console.log('Survey completed:', { surveyId: survey.id, answers });
            setIsCompleted(true);
        } catch (error) {
            console.error('Error completing survey:', error);
            setError('Failed to submit survey responses');
        } finally {
            setIsSubmitting(false);
        }
    };

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

    // Question progress calculation for current section
    const questionProgress = React.useMemo(() => {
        const currentSection = survey?.sections?.[currentSectionIndex];
        if (!currentSection) return { current: 0, total: 0, percentage: 0 };

        const totalQuestions = currentSection.questions.length;
        const answeredQuestions = currentSection.questions.filter(q => {
            const answer = answers[q.id];
            return validateAnswer(answer, q.type, q.required);
        }).length;

        return {
            current: answeredQuestions,
            total: totalQuestions,
            percentage: totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0
        };
    }, [survey, currentSectionIndex, answers, validateAnswer]);

    // Section progress for header
    const createSectionProgress = React.useCallback(() => {
        if (!survey?.sections) return [];

        const sections = [];
        
        // Welcome section
        if (survey.welcome) {
            sections.push({
                id: 'welcome',
                label: 'W',
                title: 'Welcome',
                isWelcome: true
            });
        }

        // Question sections
        survey.sections.forEach((section, index) => {
            sections.push({
                id: section.id,
                label: (index + 1).toString(),
                title: section.title,
                sectionIndex: index
            });
        });

        // Thank you section
        if (survey.thankYou) {
            sections.push({
                id: 'thank-you',
                label: 'T',
                title: 'Thank You',
                isThankYou: true
            });
        }

        return sections.map((section, index) => {
            let status = 'pending';
            
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
    if (!survey && !error) {
        return React.createElement('div', { className: 'loading' }, 'Loading survey...');
    }

    // Show error
    if (error) {
        return React.createElement('div', { className: 'error-message' }, error);
    }

    // Show welcome screen
    if (survey.welcome && currentSectionIndex === -1) {
        return React.createElement('div', { className: 'survey-app' },
            React.createElement('div', { className: 'mode-indicator' }, `Mode: ${appMode}`),
            
            // Header for welcome screen
            React.createElement('header', { className: 'survey-header' },
                React.createElement('div', { className: 'header-content' },
                    React.createElement('div', { className: 'header-brand' },
                        React.createElement('div', { className: 'brand-logo', 'aria-hidden': 'true' }, 'C'),
                        React.createElement('h1', { className: 'brand-title' }, 'CAPTRS Survey')
                    ),
                    React.createElement('div', { className: 'header-progress', 'aria-label': 'Survey progress' },
                        React.createElement('div', { className: 'progress-step active' }, 'W')
                    ),
                    React.createElement('div', { className: 'header-actions' },
                        React.createElement('div', { 
                            className: 'user-avatar',
                            title: 'User profile',
                            'aria-label': 'User profile'
                        }, '👤')
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
    if (survey.thankYou && isCompleted) {
        return React.createElement('div', { className: 'survey-app' },
            React.createElement('div', { className: 'mode-indicator' }, `Mode: ${appMode}`),
            
            // Header for thank you screen
            React.createElement('header', { className: 'survey-header' },
                React.createElement('div', { className: 'header-content' },
                    React.createElement('div', { className: 'header-brand' },
                        React.createElement('div', { className: 'brand-logo', 'aria-hidden': 'true' }, 'C'),
                        React.createElement('h1', { className: 'brand-title' }, 'CAPTRS Survey')
                    ),
                    React.createElement('div', { className: 'header-progress', 'aria-label': 'Survey progress' },
                        React.createElement('div', { className: 'progress-step completed' }, 'W'),
                        React.createElement('div', { className: 'progress-connector' }),
                        React.createElement('div', { className: 'progress-step completed' }, '1'),
                        React.createElement('div', { className: 'progress-connector' }),
                        React.createElement('div', { className: 'progress-step completed' }, '2'),
                        React.createElement('div', { className: 'progress-connector' }),
                        React.createElement('div', { className: 'progress-step active' }, 'T')
                    ),
                    React.createElement('div', { className: 'header-actions' },
                        React.createElement('div', { 
                            className: 'user-avatar',
                            title: 'User profile',
                            'aria-label': 'User profile'
                        }, '👤')
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
    const currentSection = survey.sections?.[currentSectionIndex];
    if (!currentSection) {
        return React.createElement('div', { className: 'error-message' },
            'Section not found. Please check the survey configuration.'
        );
    }

    const isLastSection = currentSectionIndex === (survey.sections?.length || 0) - 1;
    const sectionProgress = createSectionProgress();

    // Main survey interface
    return React.createElement('div', { className: 'survey-app' },
        React.createElement('div', { className: 'mode-indicator' }, `Mode: ${appMode}`),
        
        // Header (fixed positioned)
        React.createElement('header', { 
            className: 'survey-header'
        },
            React.createElement('div', { className: 'header-content' },
                React.createElement('div', { className: 'header-brand' },
                    React.createElement('div', { className: 'brand-logo', 'aria-hidden': 'true' }, 'C'),
                    React.createElement('h1', { className: 'brand-title' }, 'CAPTRS Survey')
                ),
                React.createElement('div', { className: 'header-progress', 'aria-label': 'Survey progress' },
                    sectionProgress.map((section, index) =>
                        React.createElement(React.Fragment, { key: section.id },
                            React.createElement('div', {
                                className: `progress-step ${section.status === 'active' ? 'active' : ''} ${section.status === 'completed' ? 'completed' : ''}`,
                                title: section.title,
                                'aria-label': `${section.title} - ${section.status}`
                            }, section.label),
                            index < sectionProgress.length - 1 && 
                                React.createElement('div', { className: 'progress-connector', 'aria-hidden': 'true' })
                        )
                    )
                ),
                React.createElement('div', { className: 'header-actions' },
                    React.createElement('div', { 
                        className: 'user-avatar',
                        title: 'User profile',
                        'aria-label': 'User profile'
                    }, '👤')
                )
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
        currentSection.questions.length > 0 && React.createElement('div', { 
            className: 'question-progress-container',
            style: { top: dynamicStyles.questionProgressTop }
        },
            React.createElement('div', { className: 'question-progress-header' },
                React.createElement('div', { className: 'question-progress-text' },
                    'Section Progress'
                ),
                React.createElement('div', { className: 'question-progress-count' },
                    `Question ${questionProgress.current} of ${questionProgress.total}`
                )
            ),
            React.createElement('div', { 
                className: 'question-progress-bar',
                role: 'progressbar',
                'aria-valuenow': questionProgress.percentage,
                'aria-valuemin': 0,
                'aria-valuemax': 100,
                'aria-label': `Section progress: ${questionProgress.percentage}%`
            },
                React.createElement('div', { 
                    className: 'question-progress-fill',
                    style: { width: `${questionProgress.percentage}%` }
                })
            )
        ),

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
                React.createElement('div', { className: 'footer-icon', 'aria-hidden': 'true' }, '📄')
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
