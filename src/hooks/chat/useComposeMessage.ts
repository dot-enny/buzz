import { updateDoc, doc, getDoc, collection, setDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
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

export interface OptimisticCallbacks {
    addOptimisticMessage?: (message: any) => string;
    markMessageFailed?: (tempId: string) => void;
    markMessageSent?: (tempId: string) => void;
}

// Check if this is a temporary chat (not yet persisted)
const isTempChat = (chatId: string | null): boolean => {
    return chatId?.startsWith('temp_') ?? false;
};

export const useComposeMessage = (callbacks?: OptimisticCallbacks) => {
    const { currentUser } = useUserStore();
    const { chatId, user, isGroupChat, groupData, changeChat } = useChatStore();

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

    // Create a new chat and persist to both users' userchats
    const createAndPersistChat = async (): Promise<string> => {
        const chatRef = collection(db, "chats");
        const userChatsRef = collection(db, "userchats");
        const newChatRef = doc(chatRef);

        // Create the chat document
        await setDoc(newChatRef, {
            createdAt: serverTimestamp(),
        });

        // Add to receiver's userchats
        await updateDoc(doc(userChatsRef, user.id), {
            chats: arrayUnion({
                chatId: newChatRef.id,
                lastMessage: "",
                receiverId: currentUser.id,
                isSeen: false,
                unreadCount: 1,
                updatedAt: Date.now()
            })
        });

        // Add to sender's userchats
        await updateDoc(doc(userChatsRef, currentUser.id), {
            chats: arrayUnion({
                chatId: newChatRef.id,
                lastMessage: "",
                receiverId: user.id,
                isSeen: true,
                unreadCount: 0,
                updatedAt: Date.now()
            })
        });

        return newChatRef.id;
    };

    const handleSendText = async () => {
        if ((text.trim() === "") && img.file === null) return;

        const messageText = text.trim();
        const hasImage = img.file !== null;
        const imgFile = img.file;
        const localImgUrl = img.url; // Local preview URL
        
        // Create optimistic message
        let tempId: string | undefined;
        if (callbacks?.addOptimisticMessage) {
            const optimisticMessage = {
                id: `temp_${Date.now()}`,
                senderId: currentUser.id,
                text: messageText,
                ...(localImgUrl && { img: localImgUrl }),
                ...((isGroupChat || chatId === GLOBAL_CHAT_ID) && { 
                    senderUsername: currentUser.username, 
                    senderAvatar: currentUser.avatar 
                })
            };
            tempId = callbacks.addOptimisticMessage(optimisticMessage);
        }
        
        // Clear input immediately for better UX
        resetInput();

        try {
            let actualChatId = chatId;
            
            // If this is a temporary chat, create the real chat first
            if (chatId && isTempChat(chatId)) {
                actualChatId = await createAndPersistChat();
                // Update the chat store with the real chat ID
                changeChat(actualChatId, user);
            }

            // Upload image if present
            let imgUrl: string | null = null;
            if (imgFile) {
                imgUrl = await upload(imgFile) as string;
            }
            
            // Send to Firebase
            await sendMessage(messageText, imgUrl, actualChatId);
            await updateUserChats(hasImage, messageText, actualChatId);
            
            // Mark as sent
            if (tempId && callbacks?.markMessageSent) {
                callbacks.markMessageSent(tempId);
            }
        } catch (err) {
            console.error("Error sending message:", err);
            // Mark as failed
            if (tempId && callbacks?.markMessageFailed) {
                callbacks.markMessageFailed(tempId);
            }
        }
    };

    const sendMessage = async (textMessage: string, imgUrl: string | null, actualChatId?: string | null) => {
        const targetChatId = actualChatId || chatId;
        if (targetChatId && !isTempChat(targetChatId)) {
            const messagesCollectionRef = collection(db, "chats", targetChatId, "messages");

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

    const updateUserChats = async (hasImage: boolean, messageText: string, actualChatId?: string | null) => {
        const targetChatId = actualChatId || chatId;
        if (!targetChatId || isTempChat(targetChatId)) return;
        
        // Create last message preview
        const lastMessageText = messageText
            ? (hasImage ? `📷 ${messageText}` : messageText)
            : (hasImage ? '📷 Photo' : '');
        
        // For group chats, update all participants
        if (isGroupChat && groupData?.participants) {
            const participants = groupData.participants;
            
            participants.forEach(async (userId: string) => {
                const userChatsRef = doc(db, "userchats", userId);
                const userChatsSnapshot = await getDoc(userChatsRef);

                if (userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data();
                    const chatIndex = userChatsData.chats.findIndex((chat: UserChat) => chat.chatId === targetChatId);

                    if (chatIndex !== -1) {
                        userChatsData.chats[chatIndex].lastMessage = lastMessageText;
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
                const chatIndex = userChatsData.chats.findIndex((chat: UserChatDocWithReceiverInfo) => chat.chatId === targetChatId);

                if (chatIndex !== -1) {
                    userChatsData.chats[chatIndex].lastMessage = lastMessageText;
                    
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
                }
            };
        });
    };

    // Handle GIF selection - send GIF as image message
    const handleGifSelect = async (gifUrl: string) => {
        if (!gifUrl) return;

        // Create optimistic message with GIF
        let tempId: string | undefined;
        if (callbacks?.addOptimisticMessage) {
            const optimisticMessage = {
                senderId: currentUser.id,
                senderAvatar: currentUser.avatar,
                senderUsername: currentUser.username,
                text: '',
                img: gifUrl,
                createdAt: {
                    toDate: () => new Date()
                }
            };
            tempId = callbacks.addOptimisticMessage(optimisticMessage);
        }

        try {
            // Determine the actual chat ID
            let actualChatId = chatId;

            // If this is a temporary chat, create a real one first
            if (isTempChat(chatId)) {
                actualChatId = await createAndPersistChat();
                // Update the chat store with the new real chat ID
                changeChat(actualChatId, user);
            }

            if (!actualChatId) return;

            // Create the message
            const messagesRef = collection(db, "chats", actualChatId, "messages");
            const newMessageRef = doc(messagesRef);
            
            await setDoc(newMessageRef, {
                senderId: currentUser.id,
                senderAvatar: currentUser.avatar,
                senderUsername: currentUser.username,
                text: '',
                img: gifUrl,
                createdAt: serverTimestamp(),
                readBy: []
            });

            // Mark as sent
            if (callbacks?.markMessageSent && tempId) {
                callbacks.markMessageSent(tempId);
            }

            // Update userchats with last message (for 1-on-1 chats)
            if (!useChatStore.getState().isGroupChat && !useChatStore.getState().isGlobalChat) {
                await updateUserChats(true, 'GIF', actualChatId);
            }
        } catch (err) {
            console.error('Error sending GIF:', err);
            if (callbacks?.markMessageFailed && tempId) {
                callbacks.markMessageFailed(tempId);
            }
        }
    };

    const resetInput = () => {
        setText("");
        setImg({
            file: null,
            url: "",
        });
    };

    return { handleImgSelect, img, setImg, handleSendText, text, setText, openEmoji, setOpenEmoji, handleEmoji, handleGifSelect };
};