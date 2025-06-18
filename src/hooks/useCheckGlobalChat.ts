import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../lib/firebase";
import { GLOBAL_CHAT_ID } from "./useSignup";

interface UserChatEntry {
    chatId: string;
    isSeen: boolean;
    lastMessage: string | null; // Nullable for new chats
    receiverId?: string; // Optional for global/group chats
    updatedAt: any; // Use any for Timestamp or number
    chatName?: string; // Optional: A display name for the chat
    chatType: 'private' | 'global' | 'group'; // New field to differentiate chat types
}

export const useCheckGlobalChat = () => {
    const initializeUserChatsForGlobal = async (userId: string) => {
        const userChatsRef = doc(db, "userchats", userId);

        try {
            const userChatsDoc = await getDoc(userChatsRef);

            if (!userChatsDoc.exists()) {
                // If userChats document doesn't exist, create it with the global chat entry
                console.log(`Creating userChats document for ${userId} with global chat.`);
                await setDoc(userChatsRef, {
                    chats: [{
                        chatId: GLOBAL_CHAT_ID,
                        isSeen: false, // Assuming user 'sees' global chat by default
                        lastMessage: "Welcome to Buzz!", // Initial message for global chat
                        chatName: "Global Buzz Chat", // Display name
                        chatType: 'global' // Identify it as a global chat
                    }]
                });
            } else {
                // If userChats document exists, check if global chat entry is present
                const existingChats: UserChatEntry[] = userChatsDoc.data()?.chats || [];
                const globalChatExists = existingChats.some(chat => chat.chatId === GLOBAL_CHAT_ID);

                if (!globalChatExists) {
                    // Add global chat entry if not already present
                    console.log(`Adding global chat to existing userChats for ${userId}.`);
                    await updateDoc(userChatsRef, {
                        chats: arrayUnion({
                            chatId: GLOBAL_CHAT_ID,
                            isSeen: false,
                            lastMessage: "Welcome to Buzz!",
                            updatedAt: Date.now(),
                            chatName: "Global Buzz Chat",
                            chatType: 'global'
                        })
                    });
                } else {
                    console.log(`Global chat already present in userChats for ${userId}.`);
                }
            }
        } catch (error) {
            console.error("Error initializing userChats for global chat:", error);
            // Handle error, e.g., show a toast to the user
        }
    };

    return { initializeUserChatsForGlobal };
}