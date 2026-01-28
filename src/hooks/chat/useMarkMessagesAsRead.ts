import { useEffect } from 'react';
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';

/**
 * Hook to mark all messages in the current chat as read
 * Runs when user opens a chat
 */
export const useMarkMessagesAsRead = () => {
  const { chatId } = useChatStore();
  const { currentUser } = useUserStore();

  useEffect(() => {
    const markAsRead = async () => {
      if (!chatId || !currentUser?.id) return;

      try {
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        
        // Query messages not already read by current user
        const q = query(messagesRef);
        const snapshot = await getDocs(q);

        // Batch update messages
        const updatePromises = snapshot.docs.map(async (messageDoc) => {
          const messageData = messageDoc.data();
          const readBy = messageData.readBy || [];
          
          // Only update if current user hasn't read it yet and they're not the sender
          if (!readBy.includes(currentUser.id) && messageData.senderId !== currentUser.id) {
            const messageRef = doc(db, 'chats', chatId, 'messages', messageDoc.id);
            await updateDoc(messageRef, {
              readBy: [...readBy, currentUser.id]
            });
          }
        });

        await Promise.all(updatePromises);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    // Mark messages as read when chat is opened
    if (chatId) {
      markAsRead();
    }
  }, [chatId, currentUser?.id]);
};
