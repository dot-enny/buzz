import { onSnapshot, collection, orderBy, query } from "firebase/firestore";
import { useState, useRef, useEffect, useCallback } from "react";
import { useChatStore } from "../../lib/chatStore";
import { db } from "../../lib/firebase";

export const useUpdateMessages = () => {
    const { chatId } = useChatStore();
    const [messages, setMessages] = useState<any | null>(null);
    const [pendingMessages, setPendingMessages] = useState<any[]>([]);
    const isInitialRender = useRef(true); // Use a ref for initial render

    const endRef = useRef<HTMLDivElement | null>(null);

    // Combine real messages with pending (optimistic) messages
    const allMessages = messages ? [...messages, ...pendingMessages.filter(pm => pm.status === 'sending' || pm.status === 'failed')] : pendingMessages;

    useEffect(() => {
        if (allMessages.length > 0 && endRef.current) { // Check if messages and ref exist
            if (isInitialRender.current) {
                endRef.current.scrollIntoView();
                isInitialRender.current = false;
            } else {
                endRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [allMessages]);

    useEffect(() => {
        if (chatId) {
            const messagesCollectionRef = collection(db, "chats", chatId, "messages");
            const q = query(messagesCollectionRef, orderBy("createdAt", "asc"));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedMessages: any[] = [];
                snapshot.forEach((doc) => {
                    fetchedMessages.push({ id: doc.id, ...doc.data() as Omit<any, 'id'>, status: 'sent' });
                });
                setMessages(fetchedMessages);
                
                // Remove any pending messages that have been confirmed
                setPendingMessages(prev => 
                    prev.filter(pm => !fetchedMessages.some(fm => 
                        fm.text === pm.text && 
                        Math.abs(fm.createdAt?.toDate?.()?.getTime?.() - pm.createdAt?.toDate?.()?.getTime?.()) < 5000
                    ))
                );
            }, (err) => {
                console.error("Error fetching messages:", err);
            });

            return () => unsubscribe();
        }
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
        messages: allMessages, 
        endRef, 
        addOptimisticMessage, 
        markMessageFailed, 
        removePendingMessage,
        markMessageSent 
    };
};