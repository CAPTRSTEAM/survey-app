import React from 'react';
import type { SurveyHeaderProps } from '../types/index.js';

// Ensure React is available for browser environment
const ReactInstance = window.React || (window as any).React;

export const SurveyHeader: React.FC<SurveyHeaderProps> = ({ survey, sectionProgress }) => {
  return ReactInstance.createElement('header', { 
    className: 'survey-header'
  },
    ReactInstance.createElement('div', { className: 'header-content' },
              ReactInstance.createElement('div', { className: 'header-brand' },
            ReactInstance.createElement('img', {
                src: './CAPTRS_StackedLogo_White_Square-01-01.png',
                alt: 'CAPTRS Logo',
                className: 'brand-logo'
            }),
        ReactInstance.createElement('h1', { className: 'brand-title' }, survey?.title || 'CAPTRS Survey')
      ),
      ReactInstance.createElement('div', { className: 'header-progress', 'aria-label': 'Survey progress' },
        sectionProgress.map((section, index) => {
          const className = `progress-step ${section.status === 'active' ? 'active' : ''} ${section.status === 'completed' ? 'completed' : ''}`;
          return ReactInstance.createElement(ReactInstance.Fragment, { key: section.id },
            ReactInstance.createElement('div', {
              className,
              title: section.title,
              'aria-label': `${section.title} - ${section.status}`,
              'data-type': section.sectionIndex !== undefined ? 'question' : undefined,
              'data-number': section.sectionIndex !== undefined ? section.sectionIndex + 1 : undefined
            }, section.sectionIndex !== undefined ? `Q${section.sectionIndex + 1}` : section.label),
            index < sectionProgress.length - 1 && 
              ReactInstance.createElement('div', { className: 'progress-connector', 'aria-hidden': 'true' })
          );
        })
      )
    )
  );
};
