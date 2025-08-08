import React from 'react';
import type { SurveyFooterProps } from '../types/index.js';

export const SurveyFooter: React.FC<SurveyFooterProps> = ({ 
  currentSectionIndex, 
  totalSections, 
  canNavigateNext, 
  isSubmitting, 
  onPrevious, 
  onNext, 
  onComplete 
}) => {
  const isLastSection = currentSectionIndex === totalSections - 1;

  return React.createElement('footer', { className: 'survey-footer' },
    React.createElement('div', { className: 'footer-section' },
      React.createElement('button', {
        onClick: onPrevious,
        disabled: currentSectionIndex === 0 || isSubmitting,
        className: 'button button--secondary',
        'aria-label': 'Go to previous section'
      },
        React.createElement('span', { 'aria-hidden': 'true' }, '←'),
        'Back'
      )
    ),
    React.createElement('div', { className: 'footer-center' },
      React.createElement('div', { className: 'footer-icon', 'aria-hidden': 'true' }, '✅')
    ),
    React.createElement('div', { className: 'footer-section' },
      React.createElement('button', {
        onClick: isLastSection ? onComplete : onNext,
        disabled: !canNavigateNext || isSubmitting,
        className: `button button--primary ${isSubmitting ? 'button--loading' : ''}`,
        'aria-label': isLastSection ? 'Complete survey' : 'Go to next section'
      },
        isLastSection ? 'Complete Survey' : 'Next',
        React.createElement('span', { 'aria-hidden': 'true' }, '→')
      )
    )
  );
};
