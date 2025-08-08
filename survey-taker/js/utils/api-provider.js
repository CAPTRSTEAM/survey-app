// API Provider for Platform Integration
export class ApiProvider {
    constructor() {
        console.log('🔍 ApiProvider constructor called');
        this.gameConfig = null;
        this.gameData = null;
        this.isReady = false;
        this.listeners = [];
        this.setupMessageListener();
        console.log('🔍 ApiProvider setup complete');
        
        // Don't auto-load fallback survey - let the app handle survey loading
        console.log('🔍 No auto-loading of fallback survey');
    }

    setupMessageListener() {
        console.log('🔍 Setting up message listener...');
        window.addEventListener('message', (event) => {
            console.log('🔍 Message received:', event.data);
            if (event.data.type === 'CONFIG') {
                console.log('🔍 CONFIG message received, handling...');
                this.handleConfigMessage(event.data);
            } else {
                console.log('🔍 Non-CONFIG message received, ignoring');
            }
        });
    }

    handleConfigMessage(data) {
        console.log('🔍 handleConfigMessage called with data:', data);
        try {
            // Extract platform configuration
            const { token, url, exerciseId, appInstanceId, survey, surveyConfig } = data;
            console.log('🔍 Extracted config:', { token: !!token, url: !!url, survey: !!survey, surveyConfig: !!surveyConfig });
            
            // First, check if survey data is directly in the CONFIG message
            if (survey && this.isValidSurvey(survey)) {
                console.log('🔍 Found valid survey in CONFIG message');
                this.gameConfig = survey;
                this.isReady = true;
                this.notifyListeners();
                return;
            }
            
            if (surveyConfig && this.isValidSurvey(surveyConfig)) {
                console.log('🔍 Found valid surveyConfig in CONFIG message');
                this.gameConfig = surveyConfig;
                this.isReady = true;
                this.notifyListeners();
                return;
            }
            
                                // Validate required parameters for API call
            if (!url || !token) {
                console.warn('Missing required parameters for API call');
                console.log('🔍 No valid configuration provided');
                return;
            }
            
            // Use spa-api-provider pattern: getCurrentGameConfig
            console.log('🔍 Attempting to fetch game config...');
            this.fetchGameConfig(url, token, exerciseId, appInstanceId);
        } catch (error) {
            console.error('❌ Error handling config message:', error);
        }
    }

    async fetchGameConfig(platformUrl, token, exerciseId, appInstanceId) {
        try {
            // Use the same API call as spa-api-provider: getCurrentGameConfig
            // This uses GET /api/gameConfig instead of POST /api/gameStartingData
            const response = await fetch(`${platformUrl}/api/gameConfig`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const gameStartingData = await response.json();

            // Extract survey configuration from game data
            const surveyConfig = this.extractSurveyConfig(gameStartingData);
            
            if (surveyConfig) {
                this.gameConfig = surveyConfig;
                this.isReady = true;
                this.notifyListeners();
            } else {
                console.warn('No valid survey config found in API response');
            }
        } catch (error) {
            console.error('Error fetching game config:', error);
        }
    }

    useFallbackSurvey() {
        console.log('🔍 useFallbackSurvey called!');
        console.log('🔍 Loading sample survey automatically...');
        this.gameConfig = this.getSampleSurvey();
        console.log('🔍 Sample survey loaded:', this.gameConfig);
        this.isReady = true;
        console.log('🔍 API provider is ready, notifying listeners...');
        this.notifyListeners();
    }

    extractSurveyConfig(gameStartingData) {
        try {
            // Look for survey configuration in various possible locations
            const possiblePaths = [
                'surveyConfig',
                'gameConfig.surveyConfig',
                'appConfig.surveyConfig',
                'configuration.surveyConfig',
                'data.surveyConfig',
                'survey',
                'gameConfig.survey',
                'appConfig.survey',
                'configuration.survey',
                'data.survey',
                'gameConfig',
                'appConfig',
                'configuration',
                'data',
                'config',
                'appData',
                'gameData'
            ];

            for (const path of possiblePaths) {
                const value = this.getNestedValue(gameStartingData, path);
                
                if (value && typeof value === 'object') {
                    // Check if this object looks like a survey
                    if (this.isValidSurvey(value)) {
                        return value;
                    }
                }
            }

            // If no survey config found, check if the entire gameStartingData is a survey
            if (this.isValidSurvey(gameStartingData)) {
                return gameStartingData;
            }

            return null;
        } catch (error) {
            console.error('Error extracting survey config:', error);
            return null;
        }
    }

    isValidSurvey(obj) {
        try {
            // Check if an object has the structure of a valid survey
            if (!obj || typeof obj !== 'object') {
                return false;
            }

            // Must have either questions array or be a survey-like structure
            const hasQuestions = obj.questions && Array.isArray(obj.questions) && obj.questions.length > 0;
            const hasSections = obj.sections && Array.isArray(obj.sections) && obj.sections.length > 0;
            const hasSurveyStructure = obj.id && obj.title && (hasQuestions || hasSections || obj.welcome || obj.thankYou);
            
            console.log('🔍 Survey validation:', {
                hasQuestions,
                hasSections,
                hasSurveyStructure,
                id: obj.id,
                title: obj.title,
                questionsCount: obj.questions ? obj.questions.length : 0,
                sectionsCount: obj.sections ? obj.sections.length : 0,
                hasWelcome: !!obj.welcome,
                hasThankYou: !!obj.thankYou
            });

            const isValid = hasQuestions || hasSections || hasSurveyStructure;
            console.log(`✅ Survey validation result: ${isValid}`);
            return isValid;
        } catch (error) {
            console.error('Error validating survey:', error);
            return false;
        }
    }

    getNestedValue(obj, path) {
        try {
            return path.split('.').reduce((current, key) => {
                return current && current[key] !== undefined ? current[key] : null;
            }, obj);
        } catch (error) {
            console.error('Error getting nested value:', error);
            return null;
        }
    }

    getSampleSurvey() {
        return {
            "id": "sample-survey-001",
            "title": "CAPTRS Employee Satisfaction Survey",
            "description": "Please take a moment to provide feedback about your work experience.",
            "welcome": {
                "title": "Welcome to Our Survey",
                "message": "Your feedback is valuable to us. This survey will take approximately 5-10 minutes to complete. All responses are confidential."
            },
            "thankYou": {
                "title": "Thank You!",
                "message": "Your responses have been recorded successfully. Thank you for taking the time to provide your valuable feedback."
            },
            "settings": {
                "branding": {
                    "companyName": "CAPTRS",
                    "poweredBy": "Powered by CAPTRS Survey Platform"
                }
            },
            "sections": [
                {
                    "id": "work-satisfaction",
                    "title": "Work Satisfaction",
                    "description": "Tell us about your satisfaction with your current role and work environment.",
                    "questions": [
                        {
                            "id": "q1",
                            "type": "radio",
                            "question": "How satisfied are you with your current role?",
                            "options": ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
                            "required": true
                        },
                        {
                            "id": "q2",
                            "type": "yesno",
                            "question": "Do you feel your work is meaningful and impactful?",
                            "required": true
                        },
                        {
                            "id": "q3",
                            "type": "rating",
                            "question": "Rate your overall job satisfaction (1-5 stars):",
                            "required": true
                        },
                        {
                            "id": "q4",
                            "type": "text",
                            "question": "What aspects of your job do you find most rewarding?",
                            "description": "Please be specific in your response.",
                            "required": false
                        }
                    ]
                },
                {
                    "id": "company-culture",
                    "title": "Company Culture & Environment",
                    "description": "Share your thoughts about our company culture and work environment.",
                    "questions": [
                        {
                            "id": "q5",
                            "type": "checkbox",
                            "question": "Which benefits do you value most? (Select all that apply)",
                            "options": [
                                "Health Insurance",
                                "Flexible Work Hours",
                                "Remote Work Options",
                                "Professional Development",
                                "Team Building Events",
                                "Performance Bonuses"
                            ],
                            "required": true
                        },
                        {
                            "id": "q6",
                            "type": "likert",
                            "question": "I feel supported by my immediate supervisor.",
                            "options": ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
                            "required": true
                        },
                        {
                            "id": "q7",
                            "type": "likert",
                            "question": "This company provides a supportive and inclusive work environment.",
                            "options": ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
                            "required": true
                        },
                        {
                            "id": "q8",
                            "type": "radio",
                            "question": "Would you recommend this company as a great place to work?",
                            "options": ["Definitely Yes", "Probably Yes", "Not Sure", "Probably No", "Definitely No"],
                            "required": true
                        }
                    ]
                }
            ]
        };
    }

    subscribe(callback) {
        console.log('🔍 subscribe called, isReady:', this.isReady);
        this.listeners.push(callback);
        if (this.isReady) {
            console.log('🔍 API provider is ready, calling callback immediately');
            callback(this.gameConfig);
        } else {
            console.log('🔍 API provider not ready yet, callback will be called later');
        }
    }

    notifyListeners() {
        console.log('🔍 notifyListeners called with gameConfig:', this.gameConfig);
        console.log('🔍 Number of listeners:', this.listeners.length);
        this.listeners.forEach((callback, index) => {
            console.log(`🔍 Calling listener ${index}...`);
            try {
                console.log(`🔍 About to call listener ${index} with:`, this.gameConfig);
                callback(this.gameConfig);
                console.log(`🔍 Listener ${index} called successfully`);
            } catch (error) {
                console.error('❌ Error in listener callback:', error);
            }
        });
    }

    getGameConfig() {
        return this.gameConfig;
    }

    isGameReady() {
        return this.isReady;
    }
}
