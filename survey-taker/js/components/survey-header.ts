import React from 'react';
import type { SurveyHeaderProps } from '../types/index.js';

export const SurveyHeader: React.FC<SurveyHeaderProps> = ({ survey, sectionProgress }) => {
  return React.createElement('header', { 
    className: 'survey-header'
  },
    React.createElement('div', { className: 'header-content' },
              React.createElement('div', { className: 'header-brand' },
            React.createElement('img', {
                src: './CAPTRS_StackedLogo_White_Square-01-01.png',
                alt: 'CAPTRS Logo',
                className: 'brand-logo'
            }),
        React.createElement('h1', { className: 'brand-title' }, survey?.title || 'CAPTRS Survey')
      ),
      React.createElement('div', { className: 'header-progress', 'aria-label': 'Survey progress' },
        sectionProgress.map((section, index) => {
          const className = `progress-step ${section.status === 'active' ? 'active' : ''} ${section.status === 'completed' ? 'completed' : ''}`;
          return React.createElement(React.Fragment, { key: section.id },
            React.createElement('div', {
              className,
              title: section.title,
              'aria-label': `${section.title} - ${section.status}`,
              'data-type': section.sectionIndex !== undefined ? 'question' : undefined,
              'data-number': section.sectionIndex !== undefined ? section.sectionIndex + 1 : undefined
            }, section.sectionIndex !== undefined ? `Q${section.sectionIndex + 1}` : section.label),
            index < sectionProgress.length - 1 && 
              React.createElement('div', { className: 'progress-connector', 'aria-hidden': 'true' })
          );
        })
      )
    )
  );
};
