import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '../../ui/Avatar';
import { bubblySpring } from '../../ui/ConnectionStatus';

interface MentionUser {
    id: string;
    username: string;
    avatar?: string;
}

interface MentionDropdownProps {
    isOpen: boolean;
    users: MentionUser[];
    onSelect: (user: MentionUser) => void;
    selectedIndex: number;
}

export const MentionDropdown = ({ 
    isOpen, 
    users, 
    onSelect, 
    selectedIndex 
}: MentionDropdownProps) => {
    return (
        <AnimatePresence>
            {isOpen && users.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={bubblySpring}
                    className="absolute bottom-full left-0 mb-2 w-64 bg-neutral-800 rounded-xl shadow-2xl border border-neutral-700 overflow-hidden z-50"
                >
                    <div className="p-2">
                        <p className="text-xs text-neutral-500 px-2 py-1 mb-1">Mention someone</p>
                        {users.map((user, index) => (
                            <motion.button
                                key={user.id}
                                onClick={() => onSelect(user)}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors ${
                                    index === selectedIndex 
                                        ? 'bg-blue-600/20 text-white' 
                                        : 'hover:bg-neutral-700/50 text-neutral-300'
                                }`}
                            >
                                <Avatar src={user.avatar} name={user.username} size="xs" />
                                <span className="text-sm font-medium truncate">
                                    {user.username}
                                </span>
                                {index === selectedIndex && (
                                    <span className="ml-auto text-xs text-neutral-500">↵</span>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
