import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, setDoc, onSnapshot, deleteField } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useUserStore } from '../../lib/userStore';
import { useChatStore } from '../../lib/chatStore';

interface TypingUser {
    odIdentifier: string;
    username: string;
    timestamp: number;
}

interface TypingState {
    [odIdentifier: string]: TypingUser;
}

// How long before typing status expires (in ms)
const TYPING_TIMEOUT = 3000;
// How often to send typing updates (in ms)
const TYPING_THROTTLE = 2000;

export const useTypingIndicator = () => {
    const { currentUser } = useUserStore();
    const { chatId } = useChatStore();
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const lastTypingUpdate = useRef<number>(0);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Listen for typing status changes
    useEffect(() => {
        if (!chatId) {
            setTypingUsers([]);
            return;
        }

        const typingDocRef = doc(db, 'typing', chatId);
        
        const unsubscribe = onSnapshot(typingDocRef, (snapshot) => {
            if (!snapshot.exists()) {
                setTypingUsers([]);
                return;
            }

            const data = snapshot.data() as TypingState;
            const now = Date.now();
            
            // Filter out expired typing statuses and current user
            const activeTypers = Object.values(data)
                .filter(user => 
                    user.odIdentifier !== currentUser?.id &&
                    (now - user.timestamp) < TYPING_TIMEOUT
                );
            
            setTypingUsers(activeTypers);
        });

        return () => unsubscribe();
    }, [chatId, currentUser?.id]);

    // Set typing status
    const setTyping = useCallback(async () => {
        if (!chatId || !currentUser) return;
        
        const now = Date.now();
        
        // Throttle typing updates
        if (now - lastTypingUpdate.current < TYPING_THROTTLE) {
            // Reset the timeout to clear typing later
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
                clearTyping();
            }, TYPING_TIMEOUT);
            return;
        }
        
        lastTypingUpdate.current = now;
        
        try {
            const typingDocRef = doc(db, 'typing', chatId);
            await setDoc(typingDocRef, {
                [currentUser.id]: {
                    odIdentifier: currentUser.id,
                    username: currentUser.username,
                    timestamp: now,
                }
            }, { merge: true });
            
            // Clear typing after timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
                clearTyping();
            }, TYPING_TIMEOUT);
        } catch (err) {
            console.error('Error setting typing status:', err);
        }
    }, [chatId, currentUser]);

    // Clear typing status
    const clearTyping = useCallback(async () => {
        if (!chatId || !currentUser) return;
        
        try {
            const typingDocRef = doc(db, 'typing', chatId);
            await setDoc(typingDocRef, {
                [currentUser.id]: deleteField()
            }, { merge: true });
        } catch (err) {
            // Silently fail - not critical
        }
        
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
    }, [chatId, currentUser]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            clearTyping();
        };
    }, [clearTyping]);

    return {
        typingUsers,
        setTyping,
        clearTyping,
        isTyping: typingUsers.length > 0,
    };
};

/**
 * Hook to listen for typing status in a specific chat (for chat list items)
 */
export const useChatTypingStatus = (chatId: string | null) => {
    const { currentUser } = useUserStore();
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

    useEffect(() => {
        if (!chatId) {
            setTypingUsers([]);
            return;
        }

        const typingDocRef = doc(db, 'typing', chatId);
        
        const unsubscribe = onSnapshot(typingDocRef, (snapshot) => {
            if (!snapshot.exists()) {
                setTypingUsers([]);
                return;
            }

            const data = snapshot.data() as TypingState;
            const now = Date.now();
            
            // Filter out expired typing statuses and current user
            const activeTypers = Object.values(data)
                .filter(user => 
                    user.odIdentifier !== currentUser?.id &&
                    (now - user.timestamp) < TYPING_TIMEOUT
                );
            
            setTypingUsers(activeTypers);
        }, (error) => {
            // Silently handle errors - typing status is not critical
            console.debug('Typing status listener error:', error);
        });

        return () => unsubscribe();
    }, [chatId, currentUser?.id]);

    return {
        typingUsers,
        isTyping: typingUsers.length > 0,
        typingText: typingUsers.length === 1 
            ? `${typingUsers[0].username} is typing...`
            : typingUsers.length > 1 
                ? `${typingUsers.length} people typing...`
                : null
    };
};
