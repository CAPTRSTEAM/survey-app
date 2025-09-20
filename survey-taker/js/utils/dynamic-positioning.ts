import React from 'react';
import type { DynamicStyles } from '../types/index.js';

// Ensure React is available for browser environment
const ReactInstance = window.React || (window as any).React;

export const useDynamicPositioning = (currentSectionIndex: number): DynamicStyles => {
    const [dynamicStyles, setDynamicStyles] = ReactInstance.useState<DynamicStyles>({
        questionProgressTop: '144px',
        questionsPaddingTop: '204px'
    });

    ReactInstance.useEffect(() => {
        // Simplified positioning to prevent performance issues and browser crashes
        const updatePositions = () => {
            try {
                const headerHeight = 64; // var(--header-height)
                const sectionTitleHeight = 80; // Estimated height
                const questionProgressHeight = 60; // Estimated height
                
                const questionProgressTop = headerHeight + sectionTitleHeight;
                const questionsPaddingTop = questionProgressTop + questionProgressHeight;

                const newStyles = {
                    questionProgressTop: `${questionProgressTop}px`,
                    questionsPaddingTop: `${questionsPaddingTop}px`
                };

                setDynamicStyles(prevStyles => {
                    if (prevStyles.questionProgressTop !== newStyles.questionProgressTop ||
                        prevStyles.questionsPaddingTop !== newStyles.questionsPaddingTop) {
                        return newStyles;
                    }
                    return prevStyles;
                });
            } catch (error) {
                console.error('Error updating positions:', error);
                // Use fallback values
                const fallbackStyles = {
                    questionProgressTop: '144px',
                    questionsPaddingTop: '204px'
                };
                setDynamicStyles(fallbackStyles);
            }
        };

        // Initial update
        const initialTimer = setTimeout(updatePositions, 100);

        // Simple resize handler without observers to prevent memory leaks
        let resizeTimer: number;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(updatePositions, 200);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(initialTimer);
            clearTimeout(resizeTimer);
            window.removeEventListener('resize', handleResize);
        };
    }, [currentSectionIndex]);

    return dynamicStyles;
};
