import { motion } from 'framer-motion';

interface TypingIndicatorProps {
    usernames: string[];
}

export const TypingIndicator = ({ usernames }: TypingIndicatorProps) => {
    if (usernames.length === 0) return null;

    const getTypingText = () => {
        if (usernames.length === 1) {
            return `${usernames[0]} is typing`;
        } else if (usernames.length === 2) {
            return `${usernames[0]} and ${usernames[1]} are typing`;
        } else {
            return `${usernames[0]} and ${usernames.length - 1} others are typing`;
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 px-4 py-2"
        >
            {/* Bouncing dots */}
            <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 bg-neutral-400 rounded-full"
                        animate={{
                            y: [0, -6, 0],
                        }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>
            
            {/* Text */}
            <span className="text-sm text-neutral-400 italic">
                {getTypingText()}
            </span>
        </motion.div>
    );
};

// Compact version for chat header
export const TypingIndicatorCompact = ({ usernames }: TypingIndicatorProps) => {
    if (usernames.length === 0) return null;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5"
        >
            <div className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-1.5 h-1.5 bg-green-400 rounded-full"
                        animate={{
                            y: [0, -3, 0],
                        }}
                        transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            delay: i * 0.12,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>
            <span className="text-xs text-green-400">
                {usernames.length === 1 ? 'typing...' : `${usernames.length} typing...`}
            </span>
        </motion.div>
    );
};
