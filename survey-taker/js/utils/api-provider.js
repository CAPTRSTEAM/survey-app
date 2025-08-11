// API Provider for Platform Integration
export class ApiProvider {
    constructor() {
        this.gameConfig = null;
        this.gameData = null;
        this.isReady = false;
        this.listeners = [];
        this.platformConfig = null; // Store platform configuration for API calls
        this.setupMessageListener();
        
        // Don't auto-load fallback survey - let the app handle survey loading
    }

    setupMessageListener() {
        window.addEventListener('message', (event) => {
            if (event.data.type === 'CONFIG') {
                this.handleConfigMessage(event.data);
            }
        });
    }

    handleConfigMessage(data) {
        try {
            // Extract platform configuration
            const { token, url, exerciseId, appInstanceId, survey, surveyConfig } = data;
            
            // Store platform configuration for later use in createAppData
            this.platformConfig = { token, url, exerciseId, appInstanceId };
            
            // First, check if survey data is directly in the CONFIG message
            if (survey && this.isValidSurvey(survey)) {
                this.gameConfig = survey;
                this.isReady = true;
                this.notifyListeners();
                return;
            }
            
            if (surveyConfig && this.isValidSurvey(surveyConfig)) {
                this.gameConfig = surveyConfig;
                this.isReady = true;
                this.notifyListeners();
                return;
            }
            
            // Validate required parameters for API call
            if (!url || !token) {
                console.warn('Missing required parameters for API call');
                return;
            }
            
            // Use spa-api-provider pattern: getCurrentGameConfig
            this.fetchGameConfig(url, token, exerciseId, appInstanceId);
        } catch (error) {
            console.error('Error handling config message:', error);
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
        this.gameConfig = this.getSampleSurvey();
        this.isReady = true;
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
            
            const isValid = hasQuestions || hasSections || hasSurveyStructure;
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
            "title": "Employee Satisfaction Survey",
            "description": "Please take a moment to provide feedback about your work experience.",
            "welcome": {
                "title": "Welcome to the Survey",
                "message": "Thank you for participating in our employee satisfaction survey. This will help us understand your experience and make improvements."
            },
            "thankYou": {
                "title": "Thank You!",
                "message": "Your responses have been recorded. Thank you for taking the time to provide feedback."
            },
            "settings": {
                "branding": {
                    "companyName": "CAPTRS",
                    "poweredBy": "Powered by CAPTRS"
                }
            },
            "sections": [
                {
                    "id": "work-satisfaction",
                    "title": "Work Satisfaction",
                    "description": "This section focuses on your overall satisfaction with your work and role.",
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
                            "type": "rating",
                            "question": "Rate your overall work experience (1-5 stars):",
                            "required": true
                        },
                        {
                            "id": "q3",
                            "type": "yesno",
                            "question": "Do you feel valued as an employee?",
                            "required": true
                        },
                        {
                            "id": "q4",
                            "type": "text",
                            "question": "What aspects of your job do you find most rewarding?",
                            "required": false
                        }
                    ]
                },
                {
                    "id": "company-feedback",
                    "title": "Company Feedback",
                    "description": "This section collects feedback about the company culture and environment.",
                    "questions": [
                        {
                            "id": "q5",
                            "type": "likert",
                            "question": "This company provides a supportive work environment.",
                            "options": ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
                            "required": true
                        },
                        {
                            "id": "q6",
                            "type": "checkbox",
                            "question": "Which of these company benefits are most important to you? (Select all that apply)",
                            "options": ["Health Insurance", "Flexible Hours", "Remote Work", "Professional Development", "Team Events"],
                            "required": true
                        },
                        {
                            "id": "q7",
                            "type": "checkbox",
                            "question": "Which of the following would improve your work experience? (Select all that apply)",
                            "options": ["Better Communication Tools", "More Training Opportunities", "Improved Office Space", "Better Work-Life Balance", "More Recognition"],
                            "required": false
                        },
                        {
                            "id": "q8",
                            "type": "text",
                            "question": "What improvements would you suggest for the workplace?",
                            "required": false
                        },
                        {
                            "id": "q9",
                            "type": "ranking",
                            "question": "Please rank the following work priorities in order of importance (1 = most important, 5 = least important):",
                            "options": ["Salary and Benefits", "Work-Life Balance", "Career Growth", "Company Culture", "Job Security"],
                            "required": true
                        }
                    ]
                }
            ]
        };
    }

    /**
     * Save survey data to the database using the platform API
     * @param {Object} surveyData - The survey data to save
     * @param {string} surveyData.surveyId - The survey ID
     * @param {Object} surveyData.answers - The survey answers
     * @param {string} surveyData.timestamp - Timestamp of completion
     * @param {string} surveyData.sessionId - Session identifier
     * @returns {Promise<Object>} - The response from the API
     */
    async createAppData(surveyData) {
        try {
            // Check if we have the required platform configuration
            if (!this.platformConfig || !this.platformConfig.token || !this.platformConfig.url) {
                throw new Error('Platform configuration not available. Cannot save survey data.');
            }

            const { token, url, exerciseId, appInstanceId } = this.platformConfig;

            // Prepare the data payload following the data-collect app pattern
            const payload = {
                exerciseId: exerciseId,
                appInstanceId: appInstanceId,
                surveyId: surveyData.surveyId,
                answers: surveyData.answers,
                timestamp: surveyData.timestamp,
                sessionId: surveyData.sessionId,
                completedAt: new Date().toISOString(),
                status: 'completed'
            };

            // Make the API call to save the survey data
            const response = await fetch(`${url}/api/appData`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const result = await response.json();
            console.log('Survey data saved successfully:', result);
            return result;

        } catch (error) {
            console.error('Error saving survey data:', error);
            throw error;
        }
    }

    subscribe(callback) {
        this.listeners.push(callback);
        if (this.isReady) {
            callback(this.gameConfig);
        }
    }

    notifyListeners() {
        this.listeners.forEach((callback, index) => {
            try {
                callback(this.gameConfig);
            } catch (error) {
                console.error('Error in listener callback:', error);
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
