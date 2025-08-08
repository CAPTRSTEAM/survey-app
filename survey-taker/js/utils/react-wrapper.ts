// React wrapper for TypeScript components
// This provides proper React access when React is loaded via CDN

declare global {
  interface Window {
    React: any;
  }
}

// Cast window.React to have proper typing
export const React = window.React as any;

// Re-export React types for convenience
export type FC<T = {}> = any;
export type ChangeEvent<T = Element> = any;
export type MouseEvent<T = Element> = any;
export type KeyboardEvent<T = Element> = any;
export type FormEvent<T = Element> = any;
export type FocusEvent<T = Element> = any;
export type DragEvent<T = Element> = any;
export type TouchEvent<T = Element> = any;
export type WheelEvent<T = Element> = any;
export type AnimationEvent<T = Element> = any;
export type TransitionEvent<T = Element> = any;
export type ClipboardEvent<T = Element> = any;
export type CompositionEvent<T = Element> = any;
export type InputEvent<T = Element> = any;
export type PointerEvent<T = Element> = any;
export type UIEvent<T = Element> = any;
export type SyntheticEvent<T = Element> = any;
