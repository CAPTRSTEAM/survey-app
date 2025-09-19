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

        let isUpdating = false;
        let lastUpdateTime = 0;
        const UPDATE_THROTTLE = 100; // Minimum time between updates

        const updatePositions = () => {
            // Prevent concurrent updates and throttle frequent calls
            const now = Date.now();
            if (isUpdating || (now - lastUpdateTime) < UPDATE_THROTTLE) {
                return;
            }
            
            isUpdating = true;
            lastUpdateTime = now;
            
            try {
                const headerHeight = 64; // var(--header-height)
                const sectionTitleContainer = document.querySelector('.section-title-container');
                const questionProgressContainer = document.querySelector('.question-progress-container');
                const questionsContainer = document.querySelector('.questions-container');

                if (sectionTitleContainer && questionProgressContainer && questionsContainer) {
                    const sectionTitleHeight = (sectionTitleContainer as HTMLElement).offsetHeight;
                    const questionProgressTop = headerHeight + sectionTitleHeight;
                    const questionsPaddingTop = questionProgressTop + 60; // var(--question-progress-height)

                    const newStyles = {
                        questionProgressTop: `${questionProgressTop}px`,
                        questionsPaddingTop: `${questionsPaddingTop}px`
                    };

                    // Only update if values actually changed
                    setDynamicStyles(prevStyles => {
                        if (prevStyles.questionProgressTop !== newStyles.questionProgressTop ||
                            prevStyles.questionsPaddingTop !== newStyles.questionsPaddingTop) {
                            return newStyles;
                        }
                        return prevStyles;
                    });
                } else {
                    const defaultStyles = {
                        questionProgressTop: '144px', // 64 + 80
                        questionsPaddingTop: '204px'  // 144 + 60
                    };
                    
                    setDynamicStyles(prevStyles => {
                        if (prevStyles.questionProgressTop !== defaultStyles.questionProgressTop ||
                            prevStyles.questionsPaddingTop !== defaultStyles.questionsPaddingTop) {
                            return defaultStyles;
                        }
                        return prevStyles;
                    });
                }
            } catch (error) {
                console.error('Error updating positions:', error);
                // Fallback to default values
                const fallbackStyles = {
                    questionProgressTop: '144px', // 64 + 80
                    questionsPaddingTop: '204px'  // 144 + 60
                };
                
                setDynamicStyles(prevStyles => {
                    if (prevStyles.questionProgressTop !== fallbackStyles.questionProgressTop ||
                        prevStyles.questionsPaddingTop !== fallbackStyles.questionsPaddingTop) {
                        return fallbackStyles;
                    }
                    return prevStyles;
                });
            } finally {
                isUpdating = false;
            }
        };

        // Initial update with delay to ensure DOM is ready
        const initialTimer = setTimeout(updatePositions, 100);

        // Set up observers for dynamic content changes
        try {
            // Use debounced version for observers to prevent rapid firing
            const debouncedUpdate = () => {
                setTimeout(updatePositions, 50);
            };

            resizeObserver = new ResizeObserver(debouncedUpdate);
            
            // More conservative MutationObserver configuration
            mutationObserver = new MutationObserver((mutations) => {
                // Only trigger if there are actual structural changes
                const hasStructuralChanges = mutations.some(mutation => 
                    mutation.type === 'childList' && 
                    (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)
                );
                
                if (hasStructuralChanges) {
                    debouncedUpdate();
                }
            });

            const sectionTitleContainer = document.querySelector('.section-title-container');
            if (sectionTitleContainer) {
                resizeObserver.observe(sectionTitleContainer);
                mutationObserver.observe(sectionTitleContainer, {
                    childList: true,
                    subtree: false, // Only immediate children to reduce overhead
                    characterData: false // Don't track text changes to reduce overhead
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
