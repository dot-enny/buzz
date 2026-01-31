import { Variants } from 'framer-motion';

// Fade in animation
export const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

// Slide up animation (for messages, list items)
export const slideUp: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

// Slide in from right (for panels, modals)
export const slideInRight: Variants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
};

// Slide in from left
export const slideInLeft: Variants = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
};

// Scale animation (for buttons, icons)
export const scaleIn: Variants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
};

// Pop animation (for notifications, badges)
export const pop: Variants = {
    initial: { opacity: 0, scale: 0.5 },
    animate: { 
        opacity: 1, 
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 500,
            damping: 25,
        }
    },
    exit: { opacity: 0, scale: 0.5 },
};

// Stagger children animation
export const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.05,
        },
    },
};

// List item animation (for use with stagger)
export const listItem: Variants = {
    initial: { opacity: 0, x: -10 },
    animate: { 
        opacity: 1, 
        x: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24,
        }
    },
};

// Bounce animation
export const bounce: Variants = {
    initial: { y: 0 },
    animate: {
        y: [0, -10, 0],
        transition: {
            duration: 0.6,
            ease: 'easeInOut',
            repeat: Infinity,
        },
    },
};

// Shake animation (for errors)
export const shake: Variants = {
    initial: { x: 0 },
    animate: {
        x: [0, -10, 10, -10, 10, 0],
        transition: {
            duration: 0.5,
        },
    },
};

// Pulse animation
export const pulse: Variants = {
    initial: { scale: 1 },
    animate: {
        scale: [1, 1.05, 1],
        transition: {
            duration: 2,
            ease: 'easeInOut',
            repeat: Infinity,
        },
    },
};

// Spring config presets
export const springConfig = {
    gentle: { type: 'spring', stiffness: 120, damping: 14 },
    wobbly: { type: 'spring', stiffness: 180, damping: 12 },
    stiff: { type: 'spring', stiffness: 300, damping: 20 },
    slow: { type: 'spring', stiffness: 100, damping: 20 },
    fast: { type: 'spring', stiffness: 400, damping: 25 },
} as const;

// Tap animation for buttons
export const tapAnimation = {
    whileTap: { scale: 0.95 },
    whileHover: { scale: 1.02 },
    transition: { type: 'spring', stiffness: 400, damping: 17 },
};

// Hover lift animation
export const hoverLift = {
    whileHover: { 
        y: -2, 
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' 
    },
    transition: { type: 'spring', stiffness: 400, damping: 17 },
};
