import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useThemeStore } from '../../lib/themeStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

type Theme = 'dark' | 'light' | 'system';

const themes: { value: Theme; icon: typeof SunIcon; label: string }[] = [
    { value: 'light', icon: SunIcon, label: 'Light' },
    { value: 'dark', icon: MoonIcon, label: 'Dark' },
    { value: 'system', icon: ComputerDesktopIcon, label: 'System' },
];

export const ThemeToggle = () => {
    const { theme, setTheme, resolvedTheme } = useThemeStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const CurrentIcon = resolvedTheme === 'dark' ? MoonIcon : SunIcon;

    return (
        <div className="relative" ref={dropdownRef}>
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg bg-neutral-800 dark:bg-neutral-800 light:bg-neutral-200 hover:bg-neutral-700 dark:hover:bg-neutral-700 light:hover:bg-neutral-300 transition-colors"
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle theme"
            >
                <motion.div
                    key={resolvedTheme}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <CurrentIcon className="w-5 h-5 text-neutral-300 dark:text-neutral-300 light:text-neutral-700" />
                </motion.div>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 py-2 w-36 bg-neutral-800 dark:bg-neutral-800 light:bg-white rounded-lg shadow-xl border border-neutral-700 dark:border-neutral-700 light:border-neutral-200 z-50"
                    >
                        {themes.map(({ value, icon: Icon, label }) => (
                            <button
                                key={value}
                                onClick={() => {
                                    setTheme(value);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-neutral-700 dark:hover:bg-neutral-700 light:hover:bg-neutral-100 transition-colors ${
                                    theme === value 
                                        ? 'text-blue-400' 
                                        : 'text-neutral-300 dark:text-neutral-300 light:text-neutral-700'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm">{label}</span>
                                {theme === value && (
                                    <motion.div
                                        layoutId="theme-indicator"
                                        className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"
                                    />
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
