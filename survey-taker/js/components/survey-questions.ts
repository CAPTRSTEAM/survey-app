import React from 'react';
import type { SurveyQuestionsProps } from '../types/index.js';
import { QuestionRenderer } from './question-renderer.js';

export const SurveyQuestions: React.FC<SurveyQuestionsProps> = ({ 
  currentSection, 
  answers, 
  onChange, 
  isSubmitting, 
  dynamicStyles 
}) => {
  return React.createElement('main', { 
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
            onChange,
            disabled: isSubmitting
          })
        )
      )
    )
  );
};
