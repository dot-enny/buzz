import { collection, query, orderBy, limit } from "firebase/firestore";
import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { GLOBAL_CHAT_ID } from "./useSignup";

export const useGlobalChatLastMessage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [lastMessage, setLastMessage] = useState<any>(null);

    useEffect(() => {
        setIsLoading(true);
        const messagesCollectionRef = collection(db, "chats", GLOBAL_CHAT_ID, "messages");
        const q = query(messagesCollectionRef, orderBy("createdAt", "desc"), limit(1));

        let unsubscribe: (() => void) | undefined;

        // Use onSnapshot for real-time updates
        import("firebase/firestore").then(({ onSnapshot }) => {
            unsubscribe = onSnapshot(q, (querySnapshot) => {
                let latestMessage = null;
                querySnapshot.forEach((doc) => {
                    latestMessage = doc.data();
                });
                setLastMessage(latestMessage);
                setIsLoading(false);
            });
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    return { isLoading, lastMessage }
}