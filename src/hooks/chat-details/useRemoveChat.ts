import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import { useChatStore } from "../../lib/chatStore";

export const useRemoveChat = () => {
    const { currentUser } = useUserStore();
    const { chatId, resetChat } = useChatStore();
    const [isRemoving, setIsRemoving] = useState(false);

    const removeChat = async () => {
        if (!chatId) return;
        
        setIsRemoving(true);
        try {
            const userChatsRef = doc(db, "userchats", currentUser.id);
            const userChatsDoc = await getDoc(userChatsRef);

            if (userChatsDoc.exists()) {
                const userChatsData = userChatsDoc.data();
                const updatedChats = userChatsData.chats.filter(
                    (chat: UserChat) => chat.chatId !== chatId
                );

                await updateDoc(userChatsRef, {
                    chats: updatedChats,
                });

                // Reset the current chat view
                resetChat();
            }
        } catch (err) {
            console.error("Error removing chat:", err);
        } finally {
            setIsRemoving(false);
        }
    };

    return { removeChat, isRemoving };
};
