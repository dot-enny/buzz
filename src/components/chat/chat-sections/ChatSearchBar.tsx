import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, XMarkIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef } from 'react';
import { bubblySpring } from '../../ui/ConnectionStatus';

interface SearchBarProps {
    isOpen: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onClose: () => void;
    resultCount: number;
    activeResultIndex: number;
    onNextResult: () => void;
    onPreviousResult: () => void;
}

export const ChatSearchBar = ({
    isOpen,
    searchQuery,
    setSearchQuery,
    onClose,
    resultCount,
    activeResultIndex,
    onNextResult,
    onPreviousResult,
}: SearchBarProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when search opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'Enter') {
                if (e.shiftKey) {
                    onPreviousResult();
                } else {
                    onNextResult();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, onNextResult, onPreviousResult]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={bubblySpring}
                    className="border-b border-neutral-800 overflow-hidden"
                >
                    <div className="flex items-center gap-3 px-4 py-3 bg-neutral-900/50">
                        <MagnifyingGlassIcon className="w-5 h-5 text-neutral-400 shrink-0" />
                        
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search in conversation..."
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-neutral-500 text-sm"
                        />
                        
                        {/* Results counter */}
                        {searchQuery && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-xs text-neutral-400 shrink-0"
                            >
                                {resultCount > 0 
                                    ? `${activeResultIndex + 1} of ${resultCount}`
                                    : 'No results'
                                }
                            </motion.span>
                        )}
                        
                        {/* Navigation buttons */}
                        {resultCount > 0 && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={onPreviousResult}
                                    className="p-1 rounded hover:bg-neutral-700 transition-colors"
                                    title="Previous result (Shift+Enter)"
                                >
                                    <ChevronUpIcon className="w-4 h-4 text-neutral-400" />
                                </button>
                                <button
                                    onClick={onNextResult}
                                    className="p-1 rounded hover:bg-neutral-700 transition-colors"
                                    title="Next result (Enter)"
                                >
                                    <ChevronDownIcon className="w-4 h-4 text-neutral-400" />
                                </button>
                            </div>
                        )}
                        
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="p-1 rounded hover:bg-neutral-700 transition-colors"
                            title="Close search (Esc)"
                        >
                            <XMarkIcon className="w-5 h-5 text-neutral-400" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
