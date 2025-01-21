import { updateDoc, doc, arrayUnion, getDoc } from "firebase/firestore";
import { useState } from "react";
import { useChatStore } from "../../lib/chatStore";
import { db } from "../../lib/firebase";
import { upload } from "../../lib/upload";
import { useUserStore } from "../../lib/userStore";
import { Img } from "../../components/chat/Chat";

interface UseComposeMessageProps {
    setImg: React.Dispatch<React.SetStateAction<Img>>;
    img: Img;
}

export const useComposeMessage = ({ setImg, img }: UseComposeMessageProps) => {
    const { currentUser } = useUserStore();
    const { chatId, user } = useChatStore();

    const [openEmoji, setOpenEmoji] = useState(false);
    const [text, setText] = useState('');

    const handleEmoji = (e: { emoji: string }) => {
        setText((prev) => prev + e.emoji);
        setOpenEmoji(false);
    };

    const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImg({
                file,
                url: URL.createObjectURL(file)
            });
        }
    };

    const handleSendText = async () => {
        if (text.trim() === "") return;

        try {
            const imgUrl = await handleImageUpload();
            await sendMessage(imgUrl);
            await updateUserChats();
        } catch (err) {
            console.error("Error sending message:", err);
        } finally {
            resetInput();
        }
    };

    const handleImageUpload = async (): Promise<string | null> => {
        if (img.file) {
            return await upload(img.file) as string;
        }
        return null;
    };

    const sendMessage = async (imgUrl: string | null) => {
        if (chatId) {
            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createdAt: new Date(),
                    ...(imgUrl && { img: imgUrl })
                })
            });
        }
    };

    const updateUserChats = async () => {
        const userIDs = [currentUser.id, user.id];

        userIDs.forEach(async (id) => {
            const userChatsRef = doc(db, "userchats", id);
            const userChatsSnapshot = await getDoc(userChatsRef);
  
            if (userChatsSnapshot.exists()) {
              const userChatsData = userChatsSnapshot.data();
              const chatIndex = userChatsData.chats.findIndex((chat: any) => chat.chatId === chatId);
  
              userChatsData.chats[chatIndex].lastMessage = text;
              userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
              userChatsData.chats[chatIndex].updatedAt = Date.now();
  
              await updateDoc(userChatsRef, {
                chats: userChatsData.chats,
              });
            };
          });

        // for (const id of userIDs) {
        //     const userChatsRef = doc(db, "userchats", id);
        //     const userChatsSnapshot = await getDoc(userChatsRef);

        //     if (userChatsSnapshot.exists()) {
        //         const userChatsData = userChatsSnapshot.data();
        //         const chatIndex = userChatsData.chats.findIndex((chat: any) => chat.chatId === chatId);

        //         if (chatIndex !== -1) {
        //             userChatsData.chats[chatIndex].lastMessage = text;
        //             userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
        //             userChatsData.chats[chatIndex].updatedAt = Date.now();

        //             await updateDoc(userChatsRef, {
        //                 chats: userChatsData.chats,
        //             });
        //         }
        //     }
        // }
    };

    const resetInput = () => {
        setImg({
            file: null,
            url: "",
        });
        setText("");
    };

    return { handleImg, handleSendText, text, setText, openEmoji, setOpenEmoji, handleEmoji };
};