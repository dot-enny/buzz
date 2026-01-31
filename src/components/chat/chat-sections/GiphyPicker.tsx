import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useGiphy, GiphyGif } from '../../../hooks/chat/useGiphy';
import { bubblySpring } from '../../ui/ConnectionStatus';
import { Spinner } from '../../ui/Spinner';

interface GiphyPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (gif: GiphyGif) => void;
}

export const GiphyPicker = ({ isOpen, onClose, onSelect }: GiphyPickerProps) => {
    const { gifs, isLoading, error, searchQuery, setSearchQuery } = useGiphy();

    const handleSelect = (gif: GiphyGif) => {
        onSelect(gif);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={bubblySpring}
                    className="absolute bottom-full left-0 right-0 mb-2 mx-2 sm:mx-0 sm:left-auto sm:right-4 sm:w-[360px] bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-700 overflow-hidden z-50"
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 p-3 border-b border-neutral-800">
                        <div className="flex-1 flex items-center gap-2 bg-neutral-800 rounded-lg px-3 py-2">
                            <MagnifyingGlassIcon className="w-4 h-4 text-neutral-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search GIFs..."
                                className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-neutral-500"
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5 text-neutral-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="h-[300px] overflow-y-auto p-2">
                        {isLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <Spinner />
                            </div>
                        ) : error ? (
                            <div className="h-full flex items-center justify-center text-neutral-500 text-sm">
                                {error}
                            </div>
                        ) : gifs.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-neutral-500 text-sm">
                                No GIFs found
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {gifs.map((gif) => (
                                    <motion.button
                                        key={gif.id}
                                        onClick={() => handleSelect(gif)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="relative rounded-lg overflow-hidden bg-neutral-800 aspect-video group"
                                    >
                                        <img
                                            src={gif.previewUrl}
                                            alt={gif.title}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer - Giphy attribution */}
                    <div className="p-2 border-t border-neutral-800 flex items-center justify-center">
                        <a 
                            href="https://giphy.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="opacity-50 hover:opacity-100 transition-opacity"
                        >
                            <img 
                                src="https://giphy.com/static/img/giphy_logo_square_social.png" 
                                alt="Powered by GIPHY"
                                className="h-6"
                            />
                        </a>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
