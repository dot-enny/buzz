import { useState, useEffect, useCallback } from 'react';

export const useOnlineStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showStatus, setShowStatus] = useState(false);
    const [wasEverOffline, setWasEverOffline] = useState(false);

    const handleOnline = useCallback(() => {
        setIsOnline(true);
        // Only show "back online" if we were previously offline
        if (wasEverOffline) {
            setShowStatus(true);
            // Hide after 3 seconds
            setTimeout(() => setShowStatus(false), 3000);
        }
    }, [wasEverOffline]);

    const handleOffline = useCallback(() => {
        setIsOnline(false);
        setWasEverOffline(true);
        setShowStatus(true); // Show offline status immediately
    }, []);

    useEffect(() => {
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [handleOnline, handleOffline]);

    return { isOnline, showStatus };
};
