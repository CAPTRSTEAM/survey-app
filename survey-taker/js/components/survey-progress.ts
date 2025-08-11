import React from 'react';
import type { Survey, SurveyAnswers, SectionProgress } from '../types/index.js';

// Ensure React is available for browser environment
const ReactInstance = window.React || (window as any).React;

interface SurveyProgressProps {
  survey: Survey;
  currentSectionIndex: number;
  isCompleted: boolean;
}

// Helper function to create section progress data
const createSectionProgressData = (survey: Survey): Omit<SectionProgress, 'status'>[] => {
  const sections: Omit<SectionProgress, 'status'>[] = [];
  
  // Welcome section
  if (survey.welcome) {
    sections.push({
      id: 'welcome',
      label: 'W',
      title: 'Welcome',
      isWelcome: true
    });
  }

  // Question sections
  survey.sections.forEach((section, index) => {
    sections.push({
      id: section.id,
      label: (index + 1).toString(),
      title: section.title,
      sectionIndex: index
    });
  });

  // Thank you section
  if (survey.thankYou) {
    sections.push({
      id: 'thank-you',
      label: 'T',
      title: 'Thank You',
      isThankYou: true
    });
  }

  return sections;
};

// Helper function to determine section status
const determineSectionStatus = (
  section: Omit<SectionProgress, 'status'>,
  currentSectionIndex: number,
  isCompleted: boolean
): 'pending' | 'active' | 'completed' => {
  // Welcome section logic
  if (section.isWelcome) {
    return currentSectionIndex === -1 ? 'active' : 'completed';
  }

  // Thank you section logic
  if (section.isThankYou) {
    return isCompleted ? 'completed' : 'pending';
  }

  // Question section logic
  if (section.sectionIndex !== undefined) {
    if (isCompleted) {
      return 'completed';
    }
    if (section.sectionIndex < currentSectionIndex) {
      return 'completed';
    }
    if (section.sectionIndex === currentSectionIndex) {
      return 'active';
    }
  }

  return 'pending';
};

export const SurveyProgress: React.FC<SurveyProgressProps> = ({
  survey, 
  currentSectionIndex, 
  isCompleted 
}) => {
  const sectionProgress = ReactInstance.useMemo((): SectionProgress[] => {
    if (!survey?.sections) {
      return [];
    }

    const sectionData = createSectionProgressData(survey);
    
    return sectionData.map((section: any, index: number) => ({
      ...section,
      status: determineSectionStatus(section, currentSectionIndex, isCompleted),
      index
    }));
  }, [survey, currentSectionIndex, isCompleted]);

  return ReactInstance.createElement('div', { className: 'header-progress', 'aria-label': 'Survey progress' },
    sectionProgress.map((section: any, index: number) =>
      ReactInstance.createElement(ReactInstance.Fragment, { key: section.id },
        ReactInstance.createElement('div', {
          className: `progress-step ${section.status === 'active' ? 'active' : ''} ${section.status === 'completed' ? 'completed' : ''}`,
          title: section.title,
          'aria-label': `${section.title} - ${section.status}`,
          'data-type': section.sectionIndex !== undefined ? 'question' : undefined,
          'data-number': section.sectionIndex !== undefined ? section.sectionIndex + 1 : undefined
        }, section.sectionIndex !== undefined ? `Q${section.sectionIndex + 1}` : section.label),
        index < sectionProgress.length - 1 && 
          ReactInstance.createElement('div', { className: 'progress-connector', 'aria-hidden': 'true' })
      )
    )
  );
};
