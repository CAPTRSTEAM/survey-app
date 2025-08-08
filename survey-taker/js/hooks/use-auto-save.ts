import React from 'react';
import type { SurveyAnswers } from '../types/index.js';

const STORAGE_KEY = 'survey-answers';

export const useAutoSave = (surveyId: string | null, answers: SurveyAnswers) => {
  // Load saved answers on mount
  const loadSavedAnswers = React.useCallback((): SurveyAnswers => {
    if (!surveyId) return {};
    
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}-${surveyId}`);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.warn('Failed to load saved answers:', error);
      return {};
    }
  }, [surveyId]);

  // Save answers to localStorage
  const saveAnswers = React.useCallback((newAnswers: SurveyAnswers) => {
    if (!surveyId) return;
    
    try {
      localStorage.setItem(`${STORAGE_KEY}-${surveyId}`, JSON.stringify(newAnswers));
    } catch (error) {
      console.warn('Failed to save answers:', error);
    }
  }, [surveyId]);

  // Auto-save when answers change
  React.useEffect(() => {
    if (surveyId && Object.keys(answers).length > 0) {
      saveAnswers(answers);
    }
  }, [answers, saveAnswers]);

  // Clear saved answers when survey changes
  React.useEffect(() => {
    if (surveyId) {
      // Clear old saved answers when switching surveys
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(STORAGE_KEY) && key !== `${STORAGE_KEY}-${surveyId}`) {
          localStorage.removeItem(key);
        }
      });
    }
  }, [surveyId]);

  return {
    loadSavedAnswers,
    saveAnswers,
    clearSavedAnswers: () => {
      if (surveyId) {
        localStorage.removeItem(`${STORAGE_KEY}-${surveyId}`);
      }
    }
  };
};
