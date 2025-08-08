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
        case 'ranking':
            return React.createElement(RankingQuestion, questionProps);
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
            className: 'option-group option-group--checkbox',
            role: 'group',
            'aria-labelledby': `${question.id}-label`
        },
            question.options?.map((option) => {
                const isChecked = currentAnswers.includes(option);
                return React.createElement('label', {
                    key: option,
                    className: `checkbox-item ${isChecked ? 'selected' : ''} ${disabled ? 'disabled' : ''}`,
                    tabIndex: disabled ? -1 : 0
                },
                    React.createElement('input', {
                        type: 'checkbox',
                        value: option,
                        checked: isChecked,
                        onChange: (e) => handleChange(option, e.target.checked),
                        required: question.required && currentAnswers.length === 0,
                        disabled,
                        className: 'checkbox-input'
                    }),
                    React.createElement('span', { className: 'checkbox-label' }, option)
                );
            })
        )
    );
};

// Ranking Question Component
const RankingQuestion = ({ question, answer, onChange, disabled }) => {
    const currentRanking = answer || {};
    
    const handleItemClick = (option) => {
        if (disabled) return;
        
        const currentRank = getRankForOption(option);
        let nextRank = 1;
        
        // Find the next available rank
        while (getOptionForRank(nextRank)) {
            nextRank++;
        }
        
        const newRanking = { ...currentRanking };
        
        // If item is already ranked, remove its rank
        if (currentRank > 0) {
            delete newRanking[option];
        } else {
            // Assign the next available rank
            newRanking[option] = nextRank;
        }
        
        onChange(question.id, newRanking);
    };

    const getRankForOption = (option) => {
        return currentRanking[option] || 0;
    };

    const getOptionForRank = (rank) => {
        return Object.keys(currentRanking).find(option => currentRanking[option] === rank);
    };

    const getNextAvailableRank = () => {
        let rank = 1;
        while (getOptionForRank(rank)) {
            rank++;
        }
        return rank;
    };

    return React.createElement('div', { className: 'form-control' },
        React.createElement('div', { 
            className: 'ranking-container',
            role: 'group',
            'aria-labelledby': `${question.id}-label`
        },
            React.createElement('div', { className: 'ranking-instructions' },
                'Click on items to rank them in order of importance (1 = most important):'
            ),
            React.createElement('div', { className: 'ranking-options' },
                question.options?.map((option) => {
                    const currentRank = getRankForOption(option);
                    const nextRank = getNextAvailableRank();
                    const displayRank = currentRank > 0 ? currentRank : '?';
                    
                    return React.createElement('div', {
                        key: option,
                        className: `ranking-item ${currentRank > 0 ? 'ranked' : ''} ${disabled ? 'disabled' : ''}`,
                        onClick: () => handleItemClick(option),
                        role: 'button',
                        tabIndex: disabled ? -1 : 0,
                        'aria-label': currentRank > 0 ? `${option} ranked ${currentRank}` : `Click to rank ${option}`
                    },
                        React.createElement('div', { 
                            className: 'ranking-number',
                            'aria-label': currentRank > 0 ? `Rank ${currentRank}` : 'Unranked'
                        }, displayRank),
                        React.createElement('div', { className: 'ranking-option' },
                            React.createElement('span', { className: 'ranking-text' }, option)
                        )
                    );
                })
            ),
            React.createElement('div', { className: 'ranking-summary' },
                React.createElement('span', { className: 'ranking-summary-text' },
                    `Ranked ${Object.keys(currentRanking).length} of ${question.options?.length || 0} items`
                )
            )
        )
    );
};
