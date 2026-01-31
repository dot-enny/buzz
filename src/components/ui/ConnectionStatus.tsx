import { motion, AnimatePresence } from "framer-motion";
import { WifiIcon, SignalSlashIcon } from "@heroicons/react/24/solid";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

// Bubbly spring animation config used across the app
export const bubblySpring = {
    type: "spring" as const,
    damping: 12,
    stiffness: 400,
    mass: 0.8
};

export const ConnectionStatus = () => {
    const { isOnline, showStatus } = useOnlineStatus();

    return (
        <AnimatePresence>
            {showStatus && (
                <motion.div
                    initial={{ y: -60, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -60, opacity: 0, scale: 0.8 }}
                    transition={bubblySpring}
                    className="fixed top-0 left-0 right-0 z-50 flex justify-center"
                >
                    <motion.div
                        layout
                        animate={{
                            backgroundColor: isOnline ? "#10b981" : "#ef4444",
                            scale: [1, 1.02, 1],
                        }}
                        transition={{
                            backgroundColor: { duration: 0.3 },
                            scale: { duration: 0.3 }
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 text-white shadow-lg"
                        style={{ 
                            borderRadius: "0 0 16px 16px",
                        }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isOnline ? "online" : "offline"}
                                initial={{ rotate: -180, opacity: 0, scale: 0 }}
                                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                exit={{ rotate: 180, opacity: 0, scale: 0 }}
                                transition={bubblySpring}
                            >
                                {isOnline ? (
                                    <WifiIcon className="w-5 h-5" />
                                ) : (
                                    <SignalSlashIcon className="w-5 h-5" />
                                )}
                            </motion.div>
                        </AnimatePresence>
                        
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={isOnline ? "online-text" : "offline-text"}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="text-sm font-medium whitespace-nowrap"
                            >
                                {isOnline ? "Back online!" : "You're offline"}
                            </motion.span>
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
