import React from 'react';
import type { QuestionRendererProps } from '../types/index.js';

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question, answer, onChange, disabled = false }) => {
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
const TextQuestion: React.FC<QuestionRendererProps> = ({ question, answer, onChange, disabled }) => {
    return React.createElement('div', { className: 'form-control' },
        React.createElement('textarea', {
            className: 'text-input',
            value: (answer as string) || '',
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(question.id, e.target.value),
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
const RadioQuestion: React.FC<QuestionRendererProps> = ({ question, answer, onChange, disabled }) => {
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
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(question.id, e.target.value),
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
const LikertQuestion: React.FC<QuestionRendererProps> = ({ question, answer, onChange, disabled }) => {
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
                            onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(question.id, e.target.value),
                            required: question.required,
                            disabled,
                            className: 'likert-input'
                        }),
                        React.createElement('span', { className: 'likert-label' }, option)
                    )
                )
            )
        )
    );
};

// Yes/No Question Component
const YesNoQuestion: React.FC<QuestionRendererProps> = ({ question, answer, onChange, disabled }) => {
    return React.createElement('div', { className: 'form-control' },
        React.createElement('div', { 
            className: 'option-group option-group--grid',
            role: 'radiogroup',
            'aria-labelledby': `${question.id}-label`
        },
            ['Yes', 'No'].map((option) =>
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
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(question.id, e.target.value),
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
const RatingQuestion: React.FC<QuestionRendererProps> = ({ question, answer, onChange, disabled }) => {
    const maxRating = 5;
    const ratings = Array.from({ length: maxRating }, (_, i) => i + 1);

    return React.createElement('div', { className: 'form-control' },
        React.createElement('div', { 
            className: 'rating-scale',
            role: 'radiogroup',
            'aria-labelledby': `${question.id}-label`
        },
            ratings.map((rating) => {
                // A star should be highlighted if it's less than or equal to the selected rating
                const isHighlighted = answer && rating <= answer;
                return React.createElement('label', {
                    key: rating,
                    className: `rating-option ${isHighlighted ? 'selected' : ''} ${disabled ? 'disabled' : ''}`,
                    role: 'radio',
                    'aria-checked': answer === rating,
                    tabIndex: disabled ? -1 : 0
                },
                    React.createElement('input', {
                        type: 'radio',
                        name: question.id,
                        value: rating.toString(),
                        checked: answer === rating,
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(question.id, parseInt(e.target.value)),
                        required: question.required,
                        disabled,
                        className: 'rating-input'
                    }),
                    React.createElement('span', { className: 'rating-star' }, '★')
                );
            })
        )
    );
};

// Checkbox Question Component
const CheckboxQuestion: React.FC<QuestionRendererProps> = ({ question, answer, onChange, disabled }) => {
    const currentAnswer = Array.isArray(answer) ? answer : [];
    
    const handleChange = (value: string, checked: boolean) => {
        const newAnswer = checked 
            ? [...currentAnswer, value]
            : currentAnswer.filter(item => item !== value);
        onChange(question.id, newAnswer);
    };

    return React.createElement('div', { className: 'form-control' },
        React.createElement('div', { 
            className: 'option-group option-group--grid',
            role: 'group',
            'aria-labelledby': `${question.id}-label`
        },
            question.options?.map((option) =>
                React.createElement('label', {
                    key: option,
                    className: `option-item ${currentAnswer.includes(option) ? 'selected' : ''} ${disabled ? 'disabled' : ''}`,
                    tabIndex: disabled ? -1 : 0
                },
                    React.createElement('input', {
                        type: 'checkbox',
                        name: question.id,
                        value: option,
                        checked: currentAnswer.includes(option),
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange(option, e.target.checked),
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

// Ranking Question Component
const RankingQuestion: React.FC<QuestionRendererProps> = ({ question, answer, onChange, disabled }) => {
    const currentAnswer = typeof answer === 'object' && answer !== null ? answer as Record<string, number> : {};
    const totalOptions = question.options?.length || 0;
    
    const handleItemClick = (option: string) => {
        if (disabled) return;
        
        const nextRank = getNextAvailableRank();
        const newAnswer = { ...currentAnswer, [option]: nextRank };
        
        // Only mark as complete if all options are ranked
        if (Object.keys(newAnswer).length === totalOptions) {
            onChange(question.id, newAnswer);
        } else {
            // Store partial answer but don't mark as complete
            onChange(question.id, newAnswer);
        }
    };

    const handleItemRemove = (option: string) => {
        if (disabled) return;
        
        const newAnswer = { ...currentAnswer };
        delete newAnswer[option];
        
        // When removing a ranking, the question is no longer complete
        onChange(question.id, newAnswer);
    };

    const getRankForOption = (option: string): number => {
        return currentAnswer[option] || 0;
    };

    const getNextAvailableRank = (): number => {
        const maxRank = totalOptions;
        if (maxRank === 0) return 1;
        
        const ranks = Object.values(currentAnswer);
        if (ranks.length === 0) return 1;
        
        // Find the next available rank within the valid range
        for (let rank = 1; rank <= maxRank; rank++) {
            if (!ranks.includes(rank)) {
                return rank;
            }
        }
        
        // If all ranks are used, return 0 (shouldn't happen in normal usage)
        return 0;
    };

    // Check if all options are ranked
    const isComplete = Object.keys(currentAnswer).length === totalOptions;

    return React.createElement('div', { className: 'form-control' },
        React.createElement('div', { className: 'ranking-container' },
            // Show completion status
            totalOptions > 0 && React.createElement('div', { 
                className: `ranking-status ${isComplete ? 'complete' : 'incomplete'}` 
            },
                isComplete 
                    ? `All ${totalOptions} options ranked`
                    : `${Object.keys(currentAnswer).length} of ${totalOptions} options ranked`
            ),
            React.createElement('div', { className: 'ranking-list' },
                question.options?.map((option) => {
                    const isRanked = getRankForOption(option) > 0;
                    const rankNumber = getRankForOption(option);
                    return React.createElement('div', {
                        key: option,
                        className: `ranking-item ${isRanked ? 'ranked' : ''} ${disabled ? 'disabled' : ''}`,
                        onClick: () => isRanked ? handleItemRemove(option) : handleItemClick(option),
                        tabIndex: disabled ? -1 : 0
                    },
                        // Ranking circle on the left
                        React.createElement('div', { 
                            className: `ranking-circle ${isRanked ? 'filled' : ''}` 
                        },
                            isRanked ? rankNumber : ''
                        ),
                        // Option text
                        React.createElement('span', { className: 'ranking-option' }, option),
                        // Remove button for ranked items
                        isRanked && React.createElement('button', {
                            type: 'button',
                            className: 'ranking-remove',
                            onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                                e.stopPropagation();
                                handleItemRemove(option);
                            },
                            disabled,
                            'aria-label': `Remove ${option} from ranking`
                        }, '×')
                    );
                })
            )
        )
    );
};
