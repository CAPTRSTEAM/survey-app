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
        let resizeObserver: ResizeObserver | undefined;
        let mutationObserver: MutationObserver | undefined;

        const updatePositions = () => {
            try {
                const headerHeight = 64; // var(--header-height)
                const sectionTitleContainer = document.querySelector('.section-title-container');
                const questionProgressContainer = document.querySelector('.question-progress-container');
                const questionsContainer = document.querySelector('.questions-container');

                if (sectionTitleContainer && questionProgressContainer && questionsContainer) {
                    const sectionTitleHeight = (sectionTitleContainer as HTMLElement).offsetHeight;
                    const questionProgressTop = headerHeight + sectionTitleHeight;
                    const questionsPaddingTop = questionProgressTop + 60; // var(--question-progress-height)

                    setDynamicStyles({
                        questionProgressTop: `${questionProgressTop}px`,
                        questionsPaddingTop: `${questionsPaddingTop}px`
                    });
                } else {
                    setDynamicStyles({
                        questionProgressTop: '144px', // 64 + 80
                        questionsPaddingTop: '204px'  // 144 + 60
                    });
                }
            } catch (error) {
                console.error('Error updating positions:', error);
                // Fallback to default values
                setDynamicStyles({
                    questionProgressTop: '144px', // 64 + 80
                    questionsPaddingTop: '204px'  // 144 + 60
                });
            }
        };

        // Initial update with delay to ensure DOM is ready
        const initialTimer = setTimeout(updatePositions, 100);

        // Set up observers for dynamic content changes
        try {
            resizeObserver = new ResizeObserver(updatePositions);
            mutationObserver = new MutationObserver(updatePositions);

            const sectionTitleContainer = document.querySelector('.section-title-container');
            if (sectionTitleContainer) {
                resizeObserver.observe(sectionTitleContainer);
                mutationObserver.observe(sectionTitleContainer, {
                    childList: true,
                    subtree: true,
                    characterData: true
                });
            }
        } catch (error) {
            console.warn('ResizeObserver or MutationObserver not supported:', error);
        }

        // Update on window resize with debouncing
        let resizeTimer: number;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(updatePositions, 100);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(initialTimer);
            clearTimeout(resizeTimer);
            
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
            if (mutationObserver) {
                mutationObserver.disconnect();
            }
            
            window.removeEventListener('resize', handleResize);
        };
    }, [currentSectionIndex]); // Re-run when section changes

    return dynamicStyles;
};
