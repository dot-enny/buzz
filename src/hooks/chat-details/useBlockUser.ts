import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";

export const useBlockUser = () => {
    const { currentUser, fetchUserInfo } = useUserStore();
    const { chatId, user, changeChat, isReceiverBlocked } = useChatStore();
    
    const handleBlock = async () => {
        if (!chatId) return;

        const userDocRef = doc(db, "users", currentUser.id);

        const toggleBlock = async (blockValue: ('block' | 'unblock'), id: string) => {
            try {
                await updateDoc(userDocRef, {
                    blocked: blockValue === 'block' ? arrayUnion(id) : arrayRemove(id)
                });
                refetchUserInfo(id);
            } catch (err) {
                console.log(err);
            }
        };

        const refetchUserInfo = async (blockedUserId: string) => {
            fetchUserInfo(currentUser.id);
            const receiverDocRef = doc(db, "users", blockedUserId);
            const receiverDocSnap = await getDoc(receiverDocRef);
            const user = receiverDocSnap.data();
            changeChat(chatId, user);
        };

        if (isReceiverBlocked) { 
            toggleBlock('unblock', user.id);
        } else (
            toggleBlock('block', user.id)
        );
        
    };

    return { handleBlock }
}