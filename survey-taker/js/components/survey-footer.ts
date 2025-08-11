import React from 'react';
import type { SurveyFooterProps } from '../types/index.js';

// Ensure React is available for browser environment
const ReactInstance = window.React || (window as any).React;

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

  return ReactInstance.createElement('footer', { className: 'survey-footer' },
    ReactInstance.createElement('div', { className: 'footer-section' },
      ReactInstance.createElement('button', {
        onClick: onPrevious,
        disabled: currentSectionIndex === 0 || isSubmitting,
        className: 'button button--secondary',
        'aria-label': 'Go to previous section'
      },
        ReactInstance.createElement('span', { 'aria-hidden': 'true' }, '←'),
        'Back'
      )
    ),
    ReactInstance.createElement('div', { className: 'footer-center' },
        ReactInstance.createElement('div', { className: 'footer-icon', 'aria-hidden': 'true' },
            ReactInstance.createElement('img', {
                src: './dragon.png',
                alt: 'Dragon icon',
                className: 'dragon-icon'
            })
        )
    ),
    ReactInstance.createElement('div', { className: 'footer-section' },
      ReactInstance.createElement('button', {
        onClick: isLastSection ? onComplete : onNext,
        disabled: !canNavigateNext || isSubmitting,
        className: `button button--primary ${isSubmitting ? 'button--loading' : ''}`,
        'aria-label': isLastSection ? 'Complete survey' : 'Go to next section'
      },
        isLastSection ? 'Complete Survey' : 'Next',
        ReactInstance.createElement('span', { 'aria-hidden': 'true' }, '→')
      )
    )
  );
};
