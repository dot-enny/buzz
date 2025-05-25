import { onSnapshot, collection, orderBy, query } from "firebase/firestore";
import { useState, useRef, useEffect } from "react";
import { useChatStore } from "../../lib/chatStore";
import { db } from "../../lib/firebase";

export const useUpdateMessages = () => {
    const { chatId } = useChatStore();
    const [messages, setMessages] = useState<any | null>(null);
    const isInitialRender = useRef(true); // Use a ref for initial render

    const endRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (messages && endRef.current) { // Check if messages and ref exist
            if (isInitialRender.current) {
                endRef.current.scrollIntoView();
                isInitialRender.current = false;
            } else {
                endRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [messages]);

    useEffect(() => {
        if (chatId) {
            const messagesCollectionRef = collection(db, "chats", chatId, "messages");
            const q = query(messagesCollectionRef, orderBy("createdAt", "asc"));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedMessages: any[] = [];
                snapshot.forEach((doc) => {
                    fetchedMessages.push({ id: doc.id, ...doc.data() as Omit<any, 'id'> });
                });
                console.log(fetchedMessages);
                setMessages(fetchedMessages);
            }, (err) => {
                console.error("Error fetching messages:", err);
            });

            return () => unsubscribe();
        }
    }, [chatId]);

    return { messages, endRef };
};