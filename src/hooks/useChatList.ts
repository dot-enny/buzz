import { onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useChatStore } from "../lib/chatStore";
import { db } from "../lib/firebase";
import { useUserStore } from "../lib/userStore";

export const useChatList = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [chats, setChats] = useState<any[]>([]);
    const [input, setInput] = useState('');

    const filteredChats = chats.filter((chat) => chat.user.username.toLowerCase().includes(input.toLowerCase()));

    const { currentUser } = useUserStore();
    const { changeChat, resetChat, chatId } = useChatStore();

    useEffect(() => {
        const unsub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
            const data = res.data();
            const items = data ? data.chats : [];
            const promises = items.map(async (item: any) => {
                const userDocRef = doc(db, "users", item.receiverId);
                const userDocSnap = await getDoc(userDocRef);

                const user = userDocSnap.data();

                return { ...item, user };
            })

            const chatData = await Promise.all(promises);
            setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
        });
        return () => unsub();
    }, [currentUser.id]);

    const handleSelectChat = async (chat: any) => {
        if (chatId === chat.chatId) return;

        resetChat();

        const userChats = chats.map((item) => {
            const { user, ...rest } = item;
            return rest;
        });

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
        handleSelectChat,
    }
}