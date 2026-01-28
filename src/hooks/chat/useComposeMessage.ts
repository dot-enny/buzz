import { updateDoc, doc, getDoc, collection, setDoc } from "firebase/firestore";
import { useState } from "react";
import { useChatStore } from "../../lib/chatStore";
import { db } from "../../lib/firebase";
import { upload } from "../../lib/upload";
import { useUserStore } from "../../lib/userStore";
import { GLOBAL_CHAT_ID } from "../useSignup";

export interface Img {
  file: File | null,
  url: string
}

export const useComposeMessage = () => {
    const { currentUser } = useUserStore();
    const { chatId, user, isGroupChat, groupData } = useChatStore();

    const [openEmoji, setOpenEmoji] = useState(false);
    const [text, setText] = useState('');
    const [img, setImg] = useState<Img>({
        file: null,
        url: "",
    })

    const handleEmoji = (e: { emoji: string }) => {
        setText((prev) => prev + e.emoji);
        setOpenEmoji(false);
    };

    const handleImgSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImg({
                file,
                url: URL.createObjectURL(file)
            });
        }
    };

    const handleSendText = async () => {
        if ((text.trim() === "") && img.file === null) return;

        try {
            const imgUrl = await handleImageUpload();
            await sendMessage(imgUrl);
            await updateUserChats();
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    const handleImageUpload = async (): Promise<string | null> => {
        if (img.file) {
            return await upload(img.file) as string;
        }
        return null;
    };

    const sendMessage = async (imgUrl: string | null) => {
        const textMessage = text.trim();
        resetInput();

        if (chatId) {
            const messagesCollectionRef = collection(db, "chats", chatId, "messages");

            const baseMessage = {
                senderId: currentUser.id,
                text: textMessage,
                createdAt: new Date(),
                readBy: [], // Initialize empty readBy array for read receipts
                ...(imgUrl && { img: imgUrl }),
                // Include sender info for group and global chats
                ...((isGroupChat || chatId === GLOBAL_CHAT_ID) && { 
                    senderUsername: currentUser.username, 
                    senderAvatar: currentUser.avatar 
                })
            };

            const newMessageRef = doc(messagesCollectionRef);
            await setDoc(newMessageRef, baseMessage);
        }
    };

    const updateUserChats = async () => {
        // For group chats, update all participants
        if (isGroupChat && groupData?.participants) {
            const participants = groupData.participants;
            
            participants.forEach(async (userId: string) => {
                const userChatsRef = doc(db, "userchats", userId);
                const userChatsSnapshot = await getDoc(userChatsRef);

                if (userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data();
                    const chatIndex = userChatsData.chats.findIndex((chat: UserChat) => chat.chatId === chatId);

                    if (chatIndex !== -1) {
                        userChatsData.chats[chatIndex].lastMessage = text;
                        userChatsData.chats[chatIndex].isSeen = userId === currentUser.id ? true : false;
                        
                        if (userId === currentUser.id) {
                            userChatsData.chats[chatIndex].unreadCount = 0;
                        } else {
                            userChatsData.chats[chatIndex].unreadCount = 
                                (userChatsData.chats[chatIndex].unreadCount || 0) + 1;
                        }
                        
                        userChatsData.chats[chatIndex].updatedAt = Date.now();

                        await updateDoc(userChatsRef, {
                            chats: userChatsData.chats,
                        });
                    }
                }
            });
            return;
        }
        
        // For 1-on-1 chats
        if(!user) return;
        if(user.id === undefined) return;
        
        const userIDs = [currentUser.id, user.id];

        userIDs.forEach(async (id) => {
            const userChatsRef = doc(db, "userchats", id);
            const userChatsSnapshot = await getDoc(userChatsRef);

            if (userChatsSnapshot.exists()) {
                const userChatsData = userChatsSnapshot.data();
                const chatIndex = userChatsData.chats.findIndex((chat: UserChatDocWithReceiverInfo) => chat.chatId === chatId);

                userChatsData.chats[chatIndex].lastMessage = text;
                
                // Mark as seen for sender, unseen for receiver
                userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
                
                // Increment unread count for receiver, reset for sender
                if (id === currentUser.id) {
                    userChatsData.chats[chatIndex].unreadCount = 0;
                } else {
                    userChatsData.chats[chatIndex].unreadCount = 
                        (userChatsData.chats[chatIndex].unreadCount || 0) + 1;
                }
                
                userChatsData.chats[chatIndex].updatedAt = Date.now();

                await updateDoc(userChatsRef, {
                    chats: userChatsData.chats,
                });
            };
        });
    };

    const resetInput = () => {
        setText("");
        setImg({
            file: null,
            url: "",
        });
    };

    return { handleImgSelect, img, setImg, handleSendText, text, setText, openEmoji, setOpenEmoji, handleEmoji };
};