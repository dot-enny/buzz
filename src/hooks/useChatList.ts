import { onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useChatStore } from "../lib/chatStore";
import { db } from "../lib/firebase";
import { useUserStore } from "../lib/userStore";

export const useChatList = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [chats, setChats] = useState<any[]>([]);
    const [input, setInput] = useState('');

    const filteredChats = chats.filter((chat) => { 
        if (chat.chatType !== 'global' && chat.user) {
            return chat.user.username.toLowerCase().includes(input.toLowerCase());
        }
        return false;
    });
    // const filteredGroupChats = chats.filter((chat) => chat.user.username.toLowerCase().includes(input.toLowerCase()));
    const globalChat = chats.filter((chat => chat.chatType === 'global'))[0];
    // const displayChats = [...globalChat, ...filteredChats]

    // useEffect(() => {
    //     console.log('globalChat', globalChat)
    //     console.log('P2P', filteredChats)
    //     console.log('allChats', chats)
    // }, [globalChat, filteredChats, chats])

    const { currentUser } = useUserStore();
    const { changeChat, resetChat, chatId } = useChatStore();

    useEffect(() => {
        /**
         * Subscribes to real-time updates of the current user's chat list from Firestore.
         * 
         * Listens to changes on the "userchats" document for the current user and updates the local chat state accordingly.
         * For each chat item, fetches the corresponding receiver's user data and merges it with the chat information.
         * The chat list is then sorted by the `updatedAt` timestamp in descending order
         * 
         * @constant unsub - The unsubscribe function returned by Firestore's `onSnapshot` listener.
         * Call this function to stop listening to updates when the component unmounts or when no longer needed.
         */
        const unsub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
            const data = res.data();
            const items = data ? data.chats : [];
            const promises = items.map(async (item: UserChat) => {
                if(item.receiverId) {
                    const userDocRef = doc(db, "users", item.receiverId);
                    const userDocSnap = await getDoc(userDocRef);
    
                    const user = userDocSnap.data();
                    return { ...item, user };
                }
                return item;
            })

            const chatData = await Promise.all(promises);
            setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
        });
        return () => unsub();
    }, [currentUser.id]);

    /**
     * Handles the selection of a chat by the user.
     *
     * If the selected chat is already active, the function returns early.
     * Otherwise, it resets the current chat state, marks the selected chat as seen,
     * updates the user's chat list in the Firestore database, and changes the active chat.
     *
     * @param chat - The chat object that the user has selected.
     * @returns A promise that resolves when the chat selection and update operations are complete.
     */

    const handleSelectChat = async (chat: UserChatDocWithReceiverInfo) => {
        if (chatId === chat.chatId) return;

        resetChat();

        const userChats = chats.map((item) => {
            const { user, ...rest } = item;
            return rest;
        });

        // console.log(chat)
        const chatIndex = userChats.findIndex((item) => item.chatId === chat.chatId);

        userChats[chatIndex].isSeen = true;

        const userChatsRef = doc(db, "userchats", currentUser.id);

        try {
            await updateDoc(userChatsRef, {
                chats: userChats,
            });
            changeChat(chat.chatId, chat.user);
        } catch (err) {
            console.log(err);
        };
    };

    return {
        isOpen,
        setIsOpen,
        setInput,
        filteredChats,
        globalChat,
        handleSelectChat,
    }
}