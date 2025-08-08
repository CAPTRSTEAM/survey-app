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
            ratings.map((rating) =>
                React.createElement('label', {
                    key: rating,
                    className: `rating-option ${answer === rating ? 'selected' : ''} ${disabled ? 'disabled' : ''}`,
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
                    React.createElement('span', { className: 'rating-label' }, rating)
                )
            )
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
            className: 'option-group',
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
    
    const handleItemClick = (option: string) => {
        if (disabled) return;
        
        const nextRank = getNextAvailableRank();
        const newAnswer = { ...currentAnswer, [option]: nextRank };
        onChange(question.id, newAnswer);
    };

    const handleItemRemove = (option: string) => {
        if (disabled) return;
        
        const newAnswer = { ...currentAnswer };
        delete newAnswer[option];
        onChange(question.id, newAnswer);
    };

    const getRankForOption = (option: string): number => {
        return currentAnswer[option] || 0;
    };



    const getNextAvailableRank = (): number => {
        const ranks = Object.values(currentAnswer);
        return ranks.length > 0 ? Math.max(...ranks) + 1 : 1;
    };

    return React.createElement('div', { className: 'form-control' },
        React.createElement('div', { className: 'ranking-container' },
            // Available options
            React.createElement('div', { className: 'ranking-options' },
                React.createElement('h4', { className: 'ranking-title' }, 'Available Options'),
                React.createElement('div', { className: 'ranking-list' },
                    question.options?.map((option) => {
                        const isRanked = getRankForOption(option) > 0;
                        return React.createElement('div', {
                            key: option,
                            className: `ranking-item ${isRanked ? 'ranked' : ''} ${disabled ? 'disabled' : ''}`,
                            onClick: () => handleItemClick(option),
                            tabIndex: disabled ? -1 : 0
                        },
                            React.createElement('span', { className: 'ranking-option' }, option),
                            isRanked && React.createElement('span', { className: 'ranking-rank' }, 
                                `Rank ${getRankForOption(option)}`
                            )
                        );
                    })
                )
            ),
            // Ranked options
            React.createElement('div', { className: 'ranking-results' },
                React.createElement('h4', { className: 'ranking-title' }, 'Your Ranking'),
                React.createElement('div', { className: 'ranking-list' },
                    Object.keys(currentAnswer).length > 0 
                        ? Object.keys(currentAnswer)
                            .sort((a, b) => currentAnswer[a] - currentAnswer[b])
                            .map((option) =>
                                React.createElement('div', {
                                    key: option,
                                    className: 'ranking-item ranked',
                                    onClick: () => handleItemRemove(option),
                                    tabIndex: disabled ? -1 : 0
                                },
                                    React.createElement('span', { className: 'ranking-rank' }, 
                                        `${currentAnswer[option]}.`
                                    ),
                                    React.createElement('span', { className: 'ranking-option' }, option),
                                    React.createElement('button', {
                                        type: 'button',
                                        className: 'ranking-remove',
                                        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                                            e.stopPropagation();
                                            handleItemRemove(option);
                                        },
                                        disabled,
                                        'aria-label': `Remove ${option} from ranking`
                                    }, '×')
                                )
                            )
                        : React.createElement('div', { className: 'ranking-empty' }, 
                            'Click on options above to rank them'
                          )
                )
            )
        )
    );
};
