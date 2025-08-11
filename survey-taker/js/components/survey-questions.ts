import React from 'react';
import type { SurveyQuestionsProps } from '../types/index.js';
import { QuestionRenderer } from './question-renderer.js';

// Ensure React is available for browser environment
const ReactInstance = window.React || (window as any).React;

export const SurveyQuestions: React.FC<SurveyQuestionsProps> = ({
  currentSection,
  answers,
  onChange,
  isSubmitting,
  dynamicStyles
}) => {
  return ReactInstance.createElement('main', {
    className: `questions-container ${currentSection.questions.length === 0 ? 'no-progress' : ''}`,
    style: { paddingTop: dynamicStyles.questionsPaddingTop }
  },
    ReactInstance.createElement('div', { className: 'questions-section' },
      currentSection.questions.map((question, index) =>
        ReactInstance.createElement('div', {
          key: question.id,
          className: 'question-card'
        },
          ReactInstance.createElement('div', { className: 'question-header' },
            ReactInstance.createElement('div', {
              className: 'question-number',
              'aria-hidden': 'true'
            }, index + 1),
            ReactInstance.createElement('div', { className: 'question-content' },
              ReactInstance.createElement('h3', {
                className: 'question-text',
                id: `${question.id}-label`
              },
                question.question,
                question.required && ReactInstance.createElement('span', {
                  className: 'question-required',
                  'aria-label': 'required'
                }, '*')
              )
            )
          ),
          ReactInstance.createElement(QuestionRenderer, {
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
