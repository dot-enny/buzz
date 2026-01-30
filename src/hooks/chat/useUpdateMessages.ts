import { onSnapshot, collection, orderBy, query } from "firebase/firestore";
import { useState, useRef, useEffect, useCallback } from "react";
import { useChatStore } from "../../lib/chatStore";
import { db } from "../../lib/firebase";

// Check if this is a temporary chat (not yet persisted)
const isTempChat = (chatId: string | null): boolean => {
    return chatId?.startsWith('temp_') ?? false;
};

export const useUpdateMessages = () => {
    const { chatId } = useChatStore();
    const [messages, setMessages] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingMessages, setPendingMessages] = useState<any[]>([]);
    const isInitialRender = useRef(true);
    const prevChatId = useRef<string | null>(null);

    const endRef = useRef<HTMLDivElement | null>(null);

    // Combine real messages with pending (optimistic) messages
    const allMessages = messages 
        ? [...messages, ...pendingMessages.filter(pm => pm.status === 'sending' || pm.status === 'failed')] 
        : pendingMessages.length > 0 
            ? pendingMessages 
            : null;

    // Reset state when chat changes
    useEffect(() => {
        if (chatId !== prevChatId.current) {
            setMessages(null);
            setPendingMessages([]);
            setIsLoading(true);
            isInitialRender.current = true;
            prevChatId.current = chatId;
        }
    }, [chatId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (allMessages && allMessages.length > 0 && endRef.current) {
            if (isInitialRender.current) {
                endRef.current.scrollIntoView();
                isInitialRender.current = false;
            } else {
                endRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [allMessages]);

    // Listen to messages from Firebase
    useEffect(() => {
        // For temporary chats, just show empty state immediately
        if (!chatId || isTempChat(chatId)) {
            setMessages([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const messagesCollectionRef = collection(db, "chats", chatId, "messages");
        const q = query(messagesCollectionRef, orderBy("createdAt", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages: any[] = [];
            snapshot.forEach((doc) => {
                fetchedMessages.push({ id: doc.id, ...doc.data() as Omit<any, 'id'>, status: 'sent' });
            });
            setMessages(fetchedMessages);
            setIsLoading(false);
            
            // Remove any pending messages that have been confirmed
            setPendingMessages(prev => 
                prev.filter(pm => !fetchedMessages.some(fm => 
                    fm.text === pm.text && 
                    Math.abs(fm.createdAt?.toDate?.()?.getTime?.() - pm.createdAt?.toDate?.()?.getTime?.()) < 5000
                ))
            );
        }, (err) => {
            console.error("Error fetching messages:", err);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [chatId]);

    // Add optimistic message
    const addOptimisticMessage = useCallback((message: any) => {
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const optimisticMessage = {
            ...message,
            tempId,
            status: 'sending',
            createdAt: {
                toDate: () => new Date()
            }
        };
        setPendingMessages(prev => [...prev, optimisticMessage]);
        return tempId;
    }, []);

    // Mark message as failed
    const markMessageFailed = useCallback((tempId: string) => {
        setPendingMessages(prev => 
            prev.map(pm => pm.tempId === tempId ? { ...pm, status: 'failed' } : pm)
        );
    }, []);

    // Remove pending message (after retry or cancel)
    const removePendingMessage = useCallback((tempId: string) => {
        setPendingMessages(prev => prev.filter(pm => pm.tempId !== tempId));
    }, []);

    // Mark message as sent (remove from pending)
    const markMessageSent = useCallback((tempId: string) => {
        setPendingMessages(prev => prev.filter(pm => pm.tempId !== tempId));
    }, []);

    return { 
        messages: isLoading ? null : (allMessages || []),
        isLoading,
        endRef, 
        addOptimisticMessage, 
        markMessageFailed, 
        removePendingMessage,
        markMessageSent 
    };
};