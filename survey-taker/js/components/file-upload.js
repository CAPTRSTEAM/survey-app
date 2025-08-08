// File Upload Component
const React = window.React;

export const FileUpload = ({ onSurveyLoad, disabled = false }) => {
    const [error, setError] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const fileInputRef = React.useRef(null);

    const handleFileSelect = async (file) => {
        if (!file) return;

        // Validate file type
        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
            setError('Please select a valid JSON file');
            return;
        }

        setIsLoading(true);
        setError(null);

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

            // Call the callback with the loaded survey
            onSurveyLoad(surveyData);
            setError(null);
        } catch (error) {
            console.error('Error loading survey file:', error);
            setError(`Failed to load survey: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleClick = () => {
        if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return React.createElement('div', { className: 'file-upload-container' },
        React.createElement('input', {
            ref: fileInputRef,
            type: 'file',
            accept: '.json,application/json',
            onChange: handleFileInputChange,
            style: { display: 'none' },
            disabled
        }),
        React.createElement('button', {
            onClick: handleClick,
            disabled: disabled || isLoading,
            className: `button button--primary ${isLoading ? 'button--loading' : ''}`,
            'aria-label': 'Upload survey JSON file'
        },
            isLoading ? 'Loading...' : 'Choose Survey File'
        ),
        error && React.createElement('div', { className: 'file-upload-error' },
            React.createElement('span', { className: 'error-icon', 'aria-hidden': 'true' }, '⚠️'),
            React.createElement('span', null, error)
        )
    );
};
