import { onSnapshot, doc } from "firebase/firestore";
import { useState, useRef, useEffect } from "react";
import { useChatStore } from "../../lib/chatStore";
import { db } from "../../lib/firebase";

export const useUpdateMessages = () => {
    const { chatId } = useChatStore();
    const [chat, setChat] = useState<any | null>(null);
    const isInitialRender = useRef(true); // Use a ref for initial render

    const messages = chat?.messages;

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
    }, [messages]); // Only depend on messages

    useEffect(() => {
        if (chatId) {
            const unSub = onSnapshot(
                doc(db, "chats", chatId),
                (res: any) => {
                    setChat(res.data());
                }
            );
            return () => unSub();
        }
    }, [chatId]);

    return { messages, endRef };
};