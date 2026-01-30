import { motion, AnimatePresence } from "framer-motion";
import { WifiIcon, SignalSlashIcon } from "@heroicons/react/24/solid";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

export const ConnectionStatus = () => {
    const { isOnline, wasOffline } = useOnlineStatus();

    return (
        <AnimatePresence>
            {/* Offline Banner */}
            {!isOnline && (
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white py-2 px-4 flex items-center justify-center gap-2 shadow-lg"
                >
                    <SignalSlashIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">You're offline. Messages will be sent when you reconnect.</span>
                </motion.div>
            )}

            {/* Back Online Toast */}
            {isOnline && wasOffline && (
                <motion.div
                    initial={{ y: -50, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -50, opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", damping: 15, stiffness: 400 }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white py-2 px-4 rounded-full flex items-center gap-2 shadow-lg"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: 2 }}
                    >
                        <WifiIcon className="w-5 h-5" />
                    </motion.div>
                    <span className="text-sm font-medium">You're back online!</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
