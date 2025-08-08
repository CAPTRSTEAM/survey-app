import { React } from '../utils/react-wrapper.js';
import type { SurveySection, SurveyAnswers, QuestionProgress as QuestionProgressType, DynamicStyles } from '../types/index.js';

interface QuestionProgressProps {
  currentSection: SurveySection;
  answers: SurveyAnswers;
  dynamicStyles: DynamicStyles;
}

export const QuestionProgress: React.FC<QuestionProgressProps> = ({ 
  currentSection, 
  answers, 
  dynamicStyles 
}) => {
  // Calculate question progress
  const questionProgress: QuestionProgressType = React.useMemo(() => {
    const totalQuestions = currentSection.questions.length;
    const answeredQuestions = currentSection.questions.filter(q => {
      const answer = answers[q.id];
      // Check if there's actually an answer, not just if it's valid
      if (answer === undefined || answer === null) return false;
      
      // For different question types, check if there's meaningful content
      switch (q.type) {
        case 'text':
          return typeof answer === 'string' && answer.trim().length > 0;
        case 'checkbox':
          return Array.isArray(answer) && answer.length > 0;
        case 'radio':
        case 'likert':
        case 'yesno':
          return typeof answer === 'string' && answer.length > 0;
        case 'rating':
          return typeof answer === 'number' && answer > 0;
        case 'ranking':
          return typeof answer === 'object' && answer !== null && Object.keys(answer).length > 0;
        default:
          return !!answer;
      }
    }).length;

    return {
      current: answeredQuestions,
      total: totalQuestions,
      percentage: totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0
    };
  }, [currentSection, answers]);

  return React.createElement('div', { 
    className: 'question-progress-container',
    style: { 
      top: dynamicStyles.questionProgressTop
    }
  },
    React.createElement('div', { className: 'question-progress-header' },
      React.createElement('div', { className: 'question-progress-count' },
        `Question ${questionProgress.current} of ${questionProgress.total}`
      )
    ),
    React.createElement('div', { 
      className: 'question-progress-bar',
      role: 'progressbar',
      'aria-valuenow': questionProgress.percentage,
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-label': `Question progress: ${questionProgress.percentage}%`
    },
      React.createElement('div', { 
        className: 'question-progress-fill',
        style: { 
          width: `${Math.max(questionProgress.percentage, 0)}%`
        }
      })
    )
  );
};
