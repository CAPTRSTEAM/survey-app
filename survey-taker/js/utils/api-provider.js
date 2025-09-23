// API Provider for Platform Integration
export class ApiProvider {
    constructor() {
        this.gameConfig = null;
        this.isReady = false;
        this.listeners = [];
        this.platformConfig = null; // Store platform configuration for API calls
        this.setupMessageListener();
        
        // Don't auto-load fallback survey - let the app handle survey loading
    }

    setupMessageListener() {
        console.log('Setting up message listener for CONFIG messages...');
        
        window.addEventListener('message', (event) => {
            try {
                if (event.data && event.data.type === 'CONFIG') {
                    console.log('CONFIG message received:', event.data);
                    this.handleConfigMessage(event.data);
                }
            } catch (error) {
                console.error('Error handling message:', error);
                // Fall back to sample survey on message handling errors
                this.useFallbackSurvey();
            }
        });
        
        // Set up a timeout to show timeout error if no CONFIG message arrives
        setTimeout(() => {
            if (!this.isReady) {
                console.warn('No CONFIG message received within 15 second timeout');
                if (this.onTimeout) {
                    this.onTimeout();
                } else {
                    // Fallback to sample survey if no timeout handler is registered
                    this.useFallbackSurvey();
                }
            }
        }, 15000); // 15 second timeout - more time for platform to send CONFIG
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
                console.warn('Missing required parameters for API call - falling back to sample survey');
                // Fall back to sample survey instead of failing
                this.useFallbackSurvey();
                return;
            }
            
            // Use spa-api-provider pattern: getCurrentGameConfig
            this.fetchGameConfig(url, token, exerciseId, appInstanceId);
        } catch (error) {
            console.error('Error handling config message:', error);
            // Fall back to sample survey on any error
            this.useFallbackSurvey();
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
                console.warn('No valid survey config found in API response - falling back to sample survey');
                this.useFallbackSurvey();
            }
        } catch (error) {
            console.error('Error fetching game config:', error);
            // Fall back to sample survey on API errors
            this.useFallbackSurvey();
        }
    }

    useFallbackSurvey() {
        this.gameConfig = this.getSampleSurvey();
        this.isReady = true;
        this.notifyListeners();
    }

    reset() {
        console.log('Resetting API provider');
        this.isReady = false;
        this.gameConfig = null;
        this.platformConfig = null;
        this.setupMessageListener();
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

    /**
     * Validate platform configuration is available
     * @returns {Object} Platform configuration
     * @throws {Error} If platform configuration is not available
     */
    _validatePlatformConfig() {
        if (!this.platformConfig || !this.platformConfig.token || !this.platformConfig.url) {
            throw new Error('Platform configuration not available.');
        }
        return this.platformConfig;
    }

    /**
     * Create common HTTP headers for API requests
     * @param {string} token - Authorization token
     * @returns {Object} HTTP headers
     */
    _createHeaders(token) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    /**
     * Create common base payload structure for API requests
     * @param {string} exerciseId - Exercise identifier
     * @param {string} appInstanceId - App instance identifier
     * @returns {Object} Base payload structure
     */
    _createBasePayload(exerciseId, appInstanceId) {
        return {
            exerciseId: exerciseId,
            gameConfigId: appInstanceId,
            organizationId: exerciseId
        };
    }

    /**
     * Handle HTTP response with common error handling
     * @param {Response} response - Fetch response object
     * @returns {Promise<Object>} Parsed response or error
     */
    async _handleResponse(response) {
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        // Check if response has content before trying to parse JSON
        const responseText = await response.text();
        if (!responseText || responseText.trim() === '') {
            // Empty response - API call was successful but no data returned
            return { success: true, message: 'Request completed successfully' };
        }

        // Try to parse as JSON
        try {
            return JSON.parse(responseText);
        } catch (parseError) {
            // Response is not JSON, return the text as success message
            return { success: true, message: responseText };
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
     * Updated to use the existing /api/gameData endpoint (spa-api-provider pattern)
     * @param {Object} surveyData - The survey data to save
     * @param {string} surveyData.surveyId - The survey ID
     * @param {Object} surveyData.answers - The survey answers
     * @param {string} surveyData.timestamp - Timestamp of completion
     * @param {string} surveyData.sessionId - Session identifier
     * @param {Object} surveyData.surveyStructure - Complete survey structure
     * @param {number} surveyData.timeSpent - Time spent in seconds
     * @returns {Promise<Object>} - The response from the API
     */
    async createAppData(surveyData) {
        try {
            // Validate platform configuration
            const { token, url, exerciseId, appInstanceId } = this._validatePlatformConfig();

            // Prepare the enhanced data payload following the spa-api-provider GameDataDTO pattern
            // This matches the structure expected by /api/gameData endpoint
            const enhancedData = {
                // Platform Context
                exerciseId: exerciseId,
                gameConfigId: appInstanceId, // Using appInstanceId as gameConfigId
                organizationId: exerciseId, // Using exerciseId as organizationId (adjust if needed)
                
                // Survey Metadata
                surveyId: surveyData.surveyId,
                surveyTitle: surveyData.surveyTitle || 'Survey',
                surveyDescription: surveyData.surveyDescription || null,
                surveyVersion: null, // Set to null for now
                
                // Complete Survey Structure
                surveyStructure: surveyData.surveyStructure || null,
                
                // User Responses
                answers: surveyData.answers,
                
                // Completion Metadata
                timestamp: surveyData.timestamp,
                sessionId: surveyData.sessionId,
                completedAt: new Date().toISOString(),
                timeSpent: surveyData.timeSpent || 0, // Time in seconds
                status: 'completed',
                type: 'survey-completion'
            };

            // Try enhanced data first, fallback to simple structure if it fails
            let payload;
            try {
                // Validate enhanced data structure
                if (!enhancedData.surveyId || !enhancedData.answers) {
                    throw new Error('Missing required survey data');
                }
                
                const basePayload = this._createBasePayload(exerciseId, appInstanceId);
                payload = {
                    ...basePayload,
                    data: JSON.stringify(enhancedData)
                };
            } catch (enhancedError) {
                console.warn('Enhanced data structure failed, falling back to simple structure:', enhancedError);
                
                // Fallback to simple structure - reuse basePayload from above
                payload = {
                    ...basePayload,
                    data: JSON.stringify({
                        surveyId: surveyData.surveyId,
                        answers: surveyData.answers,
                        timestamp: surveyData.timestamp,
                        sessionId: surveyData.sessionId,
                        completedAt: new Date().toISOString(),
                        status: 'completed',
                        type: 'survey-completion'
                    })
                };
            }

            // Make the API call to save the survey data using the existing /api/gameData endpoint
            const response = await fetch(`${url}/api/gameData`, {
                method: 'POST',
                headers: this._createHeaders(token),
                body: JSON.stringify(payload)
            });

            return await this._handleResponse(response);

        } catch (error) {
            console.error('Error saving survey data:', error);
            throw error;
        }
    }

    /**
     * Send APP_FINISHED event to the platform to increment finishCount
     * This allows the next item in the sequence to become active
     * @returns {Promise<Object>} - The response from the API
     */
    async sendAppFinishedEvent() {
        try {
            // Validate platform configuration
            const { token, url, exerciseId, appInstanceId } = this._validatePlatformConfig();

            // Prepare the event payload for the /api/events endpoint
            const basePayload = this._createBasePayload(exerciseId, appInstanceId);
            const eventPayload = {
                ...basePayload,
                type: 'APP_FINISHED',
                timestamp: new Date().toISOString(),
                data: JSON.stringify({
                    appInstanceId: appInstanceId,
                    exerciseId: exerciseId,
                    completedAt: new Date().toISOString(),
                    status: 'completed'
                })
            };

            // Make the API call to send the APP_FINISHED event
            const response = await fetch(`${url}/api/events`, {
                method: 'POST',
                headers: this._createHeaders(token),
                body: JSON.stringify(eventPayload)
            });

            const result = await this._handleResponse(response);
            // Override the generic success message with a specific one for this event
            if (result.success && result.message === 'Request completed successfully') {
                result.message = 'APP_FINISHED event sent successfully';
            }
            return result;

        } catch (error) {
            console.error('Error sending APP_FINISHED event:', error);
            throw error;
        }
    }

    /**
     * Retrieve survey data from the database using the platform API
     * Updated to use the existing /api/gameData endpoint (spa-api-provider pattern)
     * @param {Object} options - Options for retrieving data
     * @param {string} options.exerciseId - Exercise identifier (optional, uses stored config if not provided)
     * @param {string} options.appInstanceId - App instance identifier (optional, uses stored config if not provided)
     * @param {string} options.surveyId - Survey identifier (optional, retrieves all data if not provided)
     * @returns {Promise<Object>} - The response from the API
     */
    async getAppData(options = {}) {
        try {
            // Validate platform configuration
            const { token, url, exerciseId: configExerciseId, appInstanceId: configAppInstanceId } = this._validatePlatformConfig();
            
            // Use provided options or fall back to stored configuration
            const exerciseId = options.exerciseId || configExerciseId;
            const appInstanceId = options.appInstanceId || configAppInstanceId;
            const surveyId = options.surveyId;

            // Make the API call to retrieve the survey data using the existing /api/gameData endpoint
            const response = await fetch(`${url}/api/gameData`, {
                method: 'GET',
                headers: this._createHeaders(token)
            });

            const result = await this._handleResponse(response);
            
            // Filter by surveyId if provided (since the endpoint returns all game data)
            if (surveyId && result.gameData) {
                const filteredData = result.gameData.filter(item => {
                    try {
                        const itemData = JSON.parse(item.data);
                        return itemData.surveyId === surveyId;
                    } catch (e) {
                        return false;
                    }
                });
                return filteredData;
            }
            
            return result.gameData || result;

        } catch (error) {
            console.error('Error retrieving survey data:', error);
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
