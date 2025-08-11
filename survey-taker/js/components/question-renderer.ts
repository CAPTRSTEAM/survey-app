import React from 'react';
import type { QuestionRendererProps, QuestionType, AnswerValue } from '../types/index.js';

// Ensure React is available for browser environment
const ReactInstance = window.React || (window as any).React;

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question, answer, onChange, disabled = false }) => {
    const questionType = question.type || 'text';

    const questionProps = { question, answer, onChange, disabled };

    switch (questionType) {
        case 'text':
            return ReactInstance.createElement(TextQuestion, questionProps);
        case 'radio':
            return ReactInstance.createElement(RadioQuestion, questionProps);
        case 'likert':
            return ReactInstance.createElement(LikertQuestion, questionProps);
        case 'yesno':
            return ReactInstance.createElement(YesNoQuestion, questionProps);
        case 'rating':
            return ReactInstance.createElement(RatingQuestion, questionProps);
        case 'checkbox':
            return ReactInstance.createElement(CheckboxQuestion, questionProps);
        case 'ranking':
            return ReactInstance.createElement(RankingQuestion, questionProps);
        default:
            return ReactInstance.createElement('div', { className: 'error-message' },
                `Unsupported question type: ${questionType}`
            );
    }
};

// Text Question Component
const TextQuestion: React.FC<QuestionRendererProps> = ({ question, answer, onChange, disabled }) => {
    return ReactInstance.createElement('div', { className: 'form-control' },
        ReactInstance.createElement('textarea', {
            className: 'text-input',
            value: (answer as string) || '',
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(question.id, e.target.value),
            placeholder: 'Enter your answer...',
            required: question.required,
            disabled,
            'aria-describedby': question.description ? `${question.id}-desc` : undefined,
            'aria-labelledby': `${question.id}-label`
        }),
        question.description && ReactInstance.createElement('div', {
            id: `${question.id}-desc`,
            className: 'question-description'
        }, question.description)
    );
};

// Radio Question Component
const RadioQuestion: React.FC<QuestionRendererProps> = ({ question, answer, onChange, disabled }) => {
    return ReactInstance.createElement('div', { className: 'form-control' },
        ReactInstance.createElement('div', { 
            className: 'option-group option-group--grid',
            role: 'radiogroup',
            'aria-labelledby': `${question.id}-label`
        },
            question.options?.map((option) =>
                ReactInstance.createElement('label', {
                    key: option,
                    className: `option-item ${answer === option ? 'selected' : ''} ${disabled ? 'disabled' : ''}`,
                    role: 'radio',
                    'aria-checked': answer === option,
                    tabIndex: disabled ? -1 : 0
                },
                    ReactInstance.createElement('input', {
                        type: 'radio',
                        name: question.id,
                        value: option,
                        checked: answer === option,
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(question.id, e.target.value),
                        required: question.required,
                        disabled,
                        className: 'option-input'
                    }),
                    ReactInstance.createElement('span', { className: 'option-label' }, option)
                )
            )
        )
    );
};

// Likert Question Component
const LikertQuestion: React.FC<QuestionRendererProps> = ({ question, answer, onChange, disabled }) => {
    return ReactInstance.createElement('div', { className: 'form-control' },
        ReactInstance.createElement('div', {
            className: 'likert-scale',
            role: 'group',
            'aria-labelledby': `${question.id}-label`
        },
            ReactInstance.createElement('div', { className: 'likert-options' },
                question.options?.map((option) =>
                    ReactInstance.createElement('label', {
                        key: option,
                        className: `likert-option ${answer === option ? 'selected' : ''} ${disabled ? 'disabled' : ''}`,
                        tabIndex: disabled ? -1 : 0
                    },
                        ReactInstance.createElement('input', {
                            type: 'checkbox',
                            name: question.id,
                            value: option,
                            checked: answer === option,
                            onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(question.id, e.target.value),
                            required: question.required,
                            disabled,
                            className: 'likert-input'
                        }),
                        ReactInstance.createElement('span', { className: 'likert-label' }, option)
                    )
                )
            )
        )
    );
};

// Yes/No Question Component
const YesNoQuestion: React.FC<QuestionRendererProps> = ({ question, answer, onChange, disabled }) => {
    return ReactInstance.createElement('div', { className: 'form-control' },
        ReactInstance.createElement('div', { 
            className: 'option-group option-group--grid',
            role: 'radiogroup',
            'aria-labelledby': `${question.id}-label`
        },
            ['Yes', 'No'].map((option) =>
                ReactInstance.createElement('label', {
                    key: option,
                    className: `option-item ${answer === option ? 'selected' : ''} ${disabled ? 'disabled' : ''}`,
                    role: 'radio',
                    'aria-checked': answer === option,
                    tabIndex: disabled ? -1 : 0
                },
                    ReactInstance.createElement('input', {
                        type: 'radio',
                        name: question.id,
                        value: option,
                        checked: answer === option,
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(question.id, e.target.value),
                        required: question.required,
                        disabled,
                        className: 'option-input'
                    }),
                    ReactInstance.createElement('span', { className: 'option-label' }, option)
                )
            )
        )
    );
};

// Rating Question Component
const RatingQuestion: React.FC<QuestionRendererProps> = ({ question, answer, onChange, disabled }) => {
    const ratings = [1, 2, 3, 4, 5];
    const currentAnswer = typeof answer === 'number' ? answer : undefined;
    
    return ReactInstance.createElement('div', { className: 'form-control' },
        ReactInstance.createElement('div', { 
            className: 'rating-scale',
            role: 'radiogroup',
            'aria-labelledby': `${question.id}-label`
        },
            ratings.map((rating) => {
                // A star should be highlighted if it's less than or equal to the selected rating
                const isHighlighted = currentAnswer && rating <= currentAnswer;
                return ReactInstance.createElement('label', {
                    key: rating,
                    className: `rating-option ${isHighlighted ? 'selected' : ''} ${disabled ? 'disabled' : ''}`,
                    role: 'radio',
                    'aria-checked': currentAnswer === rating,
                    tabIndex: disabled ? -1 : 0
                },
                    ReactInstance.createElement('input', {
                        type: 'radio',
                        name: question.id,
                        value: rating.toString(),
                        checked: currentAnswer === rating,
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(question.id, parseInt(e.target.value)),
                        required: question.required,
                        disabled,
                        className: 'rating-input'
                    }),
                    ReactInstance.createElement('span', { className: 'rating-star' }, '★')
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

    return ReactInstance.createElement('div', { className: 'form-control' },
        ReactInstance.createElement('div', { 
            className: 'option-group option-group--grid',
            role: 'group',
            'aria-labelledby': `${question.id}-label`
        },
            question.options?.map((option) =>
                ReactInstance.createElement('label', {
                    key: option,
                    className: `option-item ${currentAnswer.includes(option) ? 'selected' : ''} ${disabled ? 'disabled' : ''}`,
                    tabIndex: disabled ? -1 : 0
                },
                    ReactInstance.createElement('input', {
                        type: 'checkbox',
                        name: question.id,
                        value: option,
                        checked: currentAnswer.includes(option),
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange(option, e.target.checked),
                        required: question.required,
                        disabled,
                        className: 'option-input'
                    }),
                    ReactInstance.createElement('span', { className: 'option-label' }, option)
                )
            )
        )
    );
};

// Ranking Question Component
const RankingQuestion: React.FC<QuestionRendererProps> = ({ question, answer, onChange, disabled }) => {
    const currentAnswer = typeof answer === 'object' && answer !== null ? answer as Record<string, number> : {};
    const totalOptions = question.options?.length || 0;
    
    // Use a simple variable instead of React state to avoid useState issues
    let localRankings = currentAnswer;
    
    // Drag and drop state variables
    let draggedOption: string | null = null;
    let draggedOverOption: string | null = null;
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, option: string) => {
        if (disabled) return;
        draggedOption = option;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', option);
        
        // Add visual feedback
        const target = e.currentTarget as HTMLElement;
        target.style.opacity = '0.5';
        target.style.transform = 'rotate(2deg)';
    };
    
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        if (disabled) return;
        draggedOption = null;
        draggedOverOption = null;
        
        // Remove visual feedback
        const target = e.currentTarget as HTMLElement;
        target.style.opacity = '';
        target.style.transform = '';
        
        // Remove drag-over styling from all items
        const allItems = document.querySelectorAll('.ranking-item');
        allItems.forEach(item => {
            item.classList.remove('drag-over');
        });
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, option: string) => {
        if (disabled || !draggedOption || draggedOption === option) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        draggedOverOption = option;
        
        // Add visual feedback
        const target = e.currentTarget as HTMLElement;
        target.classList.add('drag-over');
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        if (disabled) return;
        const target = e.currentTarget as HTMLElement;
        target.classList.remove('drag-over');
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropTarget: string) => {
        if (disabled || !draggedOption || draggedOption === dropTarget) return;
        e.preventDefault();
        
        // Remove drag-over styling
        const target = e.currentTarget as HTMLElement;
        target.classList.remove('drag-over');
        
        // Get current rankings
        const currentRankings = { ...localRankings };
        const draggedRank = currentRankings[draggedOption];
        const targetRank = currentRankings[dropTarget];
        
        if (draggedRank && targetRank) {
            // Swap rankings
            currentRankings[draggedOption] = targetRank;
            currentRankings[dropTarget] = draggedRank;
        } else if (draggedRank && !targetRank) {
            // Move dragged item to unranked position
            delete currentRankings[draggedOption];
            currentRankings[dropTarget] = draggedRank;
        } else if (!draggedRank && targetRank) {
            // Move unranked item to ranked position
            currentRankings[draggedOption] = targetRank;
            delete currentRankings[dropTarget];
        } else {
            // Both unranked - assign next available rank to dragged item
            const nextRank = getNextAvailableRank();
            currentRankings[draggedOption] = nextRank;
        }
        
        // Update local variable and parent state
        localRankings = currentRankings;
        onChange(question.id, currentRankings);
    };
    
    const handleItemClick = (option: string) => {
        if (disabled) return;
        
        if (localRankings[option]) {
            // Remove ranking if already ranked
            const newAnswer = { ...localRankings };
            delete newAnswer[option];
            localRankings = newAnswer;
        } else {
            // Add ranking if not ranked
            const nextRank = getNextAvailableRank();
            const newAnswer = { ...localRankings, [option]: nextRank };
            localRankings = newAnswer;
        }
        
        onChange(question.id, localRankings);
    };
    
    const getRankForOption = (option: string): number => {
        return localRankings[option] || 0;
    };
    
    const getNextAvailableRank = (): number => {
        const maxRank = totalOptions;
        if (maxRank === 0) return 1;
        
        const ranks = Object.values(localRankings);
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
    const isComplete = Object.keys(localRankings).length === totalOptions;
    
    // Sort options by rank for display
    const sortedOptions = question.options?.slice().sort((a, b) => {
        const rankA = getRankForOption(a);
        const rankB = getRankForOption(b);
        if (rankA === 0 && rankB === 0) return 0;
        if (rankA === 0) return 1;
        if (rankB === 0) return -1;
        return rankA - rankB;
    }) || [];
    
    return ReactInstance.createElement('div', { className: 'form-control' },
        ReactInstance.createElement('div', { className: 'ranking-container' },
            // Instructions
            ReactInstance.createElement('div', { className: 'ranking-instructions' },
                'Drag and drop options to rank them, or click to toggle ranking. Higher ranked items appear at the top.'
            ),
            // Show completion status
            totalOptions > 0 && ReactInstance.createElement('div', { 
                className: `ranking-status ${isComplete ? 'complete' : 'incomplete'}` 
            },
                isComplete 
                    ? `All ${totalOptions} options ranked`
                    : `${Object.keys(localRankings).length} of ${totalOptions} options ranked`
            ),
            ReactInstance.createElement('div', { className: 'ranking-list' },
                sortedOptions.map((option) => {
                    const isRanked = getRankForOption(option) > 0;
                    const rankNumber = getRankForOption(option);
                    return ReactInstance.createElement('div', {
                        key: option,
                        className: `ranking-item ${isRanked ? 'ranked' : ''} ${disabled ? 'disabled' : ''}`,
                        draggable: !disabled,
                        onClick: () => handleItemClick(option),
                        onDragStart: (e: React.DragEvent<HTMLDivElement>) => handleDragStart(e, option),
                        onDragEnd: (e: React.DragEvent<HTMLDivElement>) => handleDragEnd(e),
                        onDragOver: (e: React.DragEvent<HTMLDivElement>) => handleDragOver(e, option),
                        onDragLeave: (e: React.DragEvent<HTMLDivElement>) => handleDragLeave(e),
                        onDrop: (e: React.DragEvent<HTMLDivElement>) => handleDrop(e, option),
                        tabIndex: disabled ? -1 : 0
                    },
                        // Drag handle icon
                        ReactInstance.createElement('div', { 
                            className: 'ranking-drag-handle',
                            'aria-hidden': 'true'
                        }, '⋮⋮'),
                        // Ranking circle
                        ReactInstance.createElement('div', { 
                            className: `ranking-circle ${isRanked ? 'filled' : ''}` 
                        },
                            isRanked ? rankNumber : ''
                        ),
                        // Option text
                        ReactInstance.createElement('span', { className: 'ranking-option' }, option),
                        // Action buttons container
                        ReactInstance.createElement('div', { className: 'ranking-actions' },
                            // Up arrow button
                            isRanked && rankNumber > 1 && ReactInstance.createElement('button', {
                                type: 'button',
                                className: 'ranking-arrow ranking-arrow-up',
                                onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.stopPropagation();
                                    const newAnswer = { ...localRankings };
                                    // Find the option with the rank above this one
                                    const optionAbove = Object.keys(newAnswer).find(key => newAnswer[key] === rankNumber - 1);
                                    if (optionAbove) {
                                        // Swap ranks
                                        newAnswer[option] = rankNumber - 1;
                                        newAnswer[optionAbove] = rankNumber;
                                        localRankings = newAnswer;
                                        onChange(question.id, newAnswer);
                                    }
                                },
                                disabled,
                                'aria-label': `Move ${option} up in ranking`
                            }, '↑'),
                            // Down arrow button
                            isRanked && rankNumber < Object.keys(localRankings).length && ReactInstance.createElement('button', {
                                type: 'button',
                                className: 'ranking-arrow ranking-arrow-down',
                                onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.stopPropagation();
                                    const newAnswer = { ...localRankings };
                                    // Find the option with the rank below this one
                                    const optionBelow = Object.keys(newAnswer).find(key => newAnswer[key] === rankNumber + 1);
                                    if (optionBelow) {
                                        // Swap ranks
                                        newAnswer[option] = rankNumber + 1;
                                        newAnswer[optionBelow] = rankNumber;
                                        localRankings = newAnswer;
                                        onChange(question.id, newAnswer);
                                    }
                                },
                                disabled,
                                'aria-label': `Move ${option} down in ranking`
                            }, '↓'),
                            // Remove button for ranked items
                            isRanked && ReactInstance.createElement('button', {
                                type: 'button',
                                className: 'ranking-remove',
                                onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.stopPropagation();
                                    const newAnswer = { ...localRankings };
                                    delete newAnswer[option];
                                    localRankings = newAnswer;
                                    onChange(question.id, newAnswer);
                                },
                                disabled,
                                'aria-label': `Remove ranking for ${option}`
                            }, '×')
                        )
                    );
                })
            )
        )
    );
};
