// Question Renderer Component
const React = window.React;

export const QuestionRenderer = ({ question, answer, onChange, disabled = false }) => {
    const questionType = question.type || 'text';

    const questionProps = { question, answer, onChange, disabled };

    switch (questionType) {
        case 'text':
            return React.createElement(TextQuestion, questionProps);
        case 'radio':
            return React.createElement(RadioQuestion, questionProps);
        case 'likert':
            return React.createElement(LikertQuestion, questionProps);
        case 'yesno':
            return React.createElement(YesNoQuestion, questionProps);
        case 'rating':
            return React.createElement(RatingQuestion, questionProps);
        case 'checkbox':
            return React.createElement(CheckboxQuestion, questionProps);
        default:
            return React.createElement('div', { className: 'error-message' },
                `Unsupported question type: ${questionType}`
            );
    }
};

// Text Question Component
const TextQuestion = ({ question, answer, onChange, disabled }) => {
    return React.createElement('div', { className: 'form-control' },
        React.createElement('textarea', {
            className: 'text-input',
            value: answer || '',
            onChange: (e) => onChange(question.id, e.target.value),
            placeholder: 'Enter your answer...',
            required: question.required,
            disabled,
            'aria-describedby': question.description ? `${question.id}-desc` : undefined,
            'aria-labelledby': `${question.id}-label`
        }),
        question.description && React.createElement('div', {
            id: `${question.id}-desc`,
            className: 'question-description'
        }, question.description)
    );
};

// Radio Question Component
const RadioQuestion = ({ question, answer, onChange, disabled }) => {
    return React.createElement('div', { className: 'form-control' },
        React.createElement('div', { 
            className: 'option-group option-group--grid',
            role: 'radiogroup',
            'aria-labelledby': `${question.id}-label`
        },
            question.options?.map((option) =>
                React.createElement('label', {
                    key: option,
                    className: `option-item ${answer === option ? 'selected' : ''} ${disabled ? 'disabled' : ''}`,
                    role: 'radio',
                    'aria-checked': answer === option,
                    tabIndex: disabled ? -1 : 0
                },
                    React.createElement('input', {
                        type: 'radio',
                        name: question.id,
                        value: option,
                        checked: answer === option,
                        onChange: (e) => onChange(question.id, e.target.value),
                        required: question.required,
                        disabled,
                        className: 'option-input'
                    }),
                    React.createElement('span', { className: 'option-label' }, option)
                )
            )
        )
    );
};

// Likert Question Component
const LikertQuestion = ({ question, answer, onChange, disabled }) => {
    return React.createElement('div', { className: 'form-control' },
        React.createElement('div', { className: 'likert-scale' },
            React.createElement('div', { 
                className: 'likert-options',
                role: 'radiogroup',
                'aria-labelledby': `${question.id}-label`
            },
                question.options?.map((option) =>
                    React.createElement('label', {
                        key: option,
                        className: `likert-option ${answer === option ? 'selected' : ''} ${disabled ? 'disabled' : ''}`,
                        role: 'radio',
                        'aria-checked': answer === option,
                        tabIndex: disabled ? -1 : 0
                    },
                        React.createElement('input', {
                            type: 'radio',
                            name: question.id,
                            value: option,
                            checked: answer === option,
                            onChange: (e) => onChange(question.id, e.target.value),
                            required: question.required,
                            disabled,
                            className: 'option-input'
                        }),
                        React.createElement('span', { className: 'likert-label' }, option)
                    )
                )
            )
        )
    );
};

// Yes/No Question Component
const YesNoQuestion = ({ question, answer, onChange, disabled }) => {
    const options = ['Yes', 'No'];
    
    return React.createElement('div', { className: 'form-control' },
        React.createElement('div', { 
            className: 'option-group option-group--horizontal',
            role: 'radiogroup',
            'aria-labelledby': `${question.id}-label`
        },
            options.map((option) =>
                React.createElement('label', {
                    key: option,
                    className: `option-item ${answer === option ? 'selected' : ''} ${disabled ? 'disabled' : ''}`,
                    role: 'radio',
                    'aria-checked': answer === option,
                    tabIndex: disabled ? -1 : 0
                },
                    React.createElement('input', {
                        type: 'radio',
                        name: question.id,
                        value: option,
                        checked: answer === option,
                        onChange: (e) => onChange(question.id, e.target.value),
                        required: question.required,
                        disabled,
                        className: 'option-input'
                    }),
                    React.createElement('span', { className: 'option-label' }, option)
                )
            )
        )
    );
};

// Rating Question Component
const RatingQuestion = ({ question, answer, onChange, disabled }) => {
    const [hoveredStar, setHoveredStar] = React.useState(0);
    const stars = 5;

    return React.createElement('div', { className: 'form-control' },
        React.createElement('div', { 
            className: 'star-rating',
            role: 'radiogroup',
            'aria-labelledby': `${question.id}-label`,
            onMouseLeave: () => setHoveredStar(0)
        },
            Array.from({ length: stars }, (_, i) => {
                const starValue = i + 1;
                const isSelected = answer >= starValue;
                const isHighlighted = hoveredStar >= starValue;
                
                return React.createElement('label', {
                    key: starValue,
                    className: `star-item ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''} ${disabled ? 'disabled' : ''}`,
                    onMouseEnter: () => !disabled && setHoveredStar(starValue),
                    role: 'radio',
                    'aria-checked': answer === starValue,
                    'aria-label': `${starValue} star${starValue !== 1 ? 's' : ''}`,
                    tabIndex: disabled ? -1 : 0
                },
                    React.createElement('input', {
                        type: 'radio',
                        name: question.id,
                        value: starValue,
                        checked: answer === starValue,
                        onChange: (e) => onChange(question.id, parseInt(e.target.value)),
                        required: question.required,
                        disabled,
                        className: 'option-input'
                    }),
                    '★'
                );
            })
        )
    );
};

// Checkbox Question Component
const CheckboxQuestion = ({ question, answer, onChange, disabled }) => {
    const currentAnswers = Array.isArray(answer) ? answer : [];

    const handleChange = (value, checked) => {
        const newAnswers = checked 
            ? [...currentAnswers, value]
            : currentAnswers.filter(v => v !== value);
        onChange(question.id, newAnswers);
    };

    return React.createElement('div', { className: 'form-control' },
        React.createElement('div', { 
            className: 'option-group option-group--stack',
            role: 'group',
            'aria-labelledby': `${question.id}-label`
        },
            question.options?.map((option) => {
                const isChecked = currentAnswers.includes(option);
                return React.createElement('label', {
                    key: option,
                    className: `option-item ${isChecked ? 'selected' : ''} ${disabled ? 'disabled' : ''}`,
                    tabIndex: disabled ? -1 : 0
                },
                    React.createElement('input', {
                        type: 'checkbox',
                        value: option,
                        checked: isChecked,
                        onChange: (e) => handleChange(option, e.target.checked),
                        required: question.required && currentAnswers.length === 0,
                        disabled,
                        className: 'option-input'
                    }),
                    React.createElement('span', { className: 'option-label' }, option)
                );
            })
        )
    );
};
