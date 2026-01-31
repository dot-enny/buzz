import { useEffect } from 'react';
import { collection, query, onSnapshot, doc, writeBatch, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';

/**
 * Hook to mark all messages in the current chat as read
 * Runs when user opens a chat and listens for new messages
 */
export const useMarkMessagesAsRead = () => {
  const { chatId } = useChatStore();
  const { currentUser } = useUserStore();

  useEffect(() => {
    if (!chatId || !currentUser?.id) return;

    // Real-time listener for messages
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef);

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const batch = writeBatch(db);
      let hasUpdates = false;

      snapshot.docs.forEach((messageDoc) => {
        const messageData = messageDoc.data();
        const readBy = messageData.readBy || [];
        
        // Only update if current user hasn't read it yet and they're not the sender
        if (!readBy.includes(currentUser.id) && messageData.senderId !== currentUser.id) {
          const messageRef = doc(db, 'chats', chatId, 'messages', messageDoc.id);
          batch.update(messageRef, {
            readBy: [...readBy, currentUser.id]
          });
          hasUpdates = true;
        }
      });

      if (hasUpdates) {
        try {
          await batch.commit();
          
          // Also update the userchats document to reset unread count and mark as seen
          const userChatsRef = doc(db, 'userchats', currentUser.id);
          const userChatsDoc = await getDoc(userChatsRef);
          
          if (userChatsDoc.exists()) {
            const userChatsData = userChatsDoc.data();
            const chatIndex = userChatsData.chats.findIndex((chat: UserChat) => chat.chatId === chatId);
            
            if (chatIndex !== -1) {
              userChatsData.chats[chatIndex].isSeen = true;
              userChatsData.chats[chatIndex].unreadCount = 0;
              
              await updateDoc(userChatsRef, {
                chats: userChatsData.chats,
              });
            }
          }
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      }
    });

    return () => unsubscribe();
  }, [chatId, currentUser?.id]);
};
