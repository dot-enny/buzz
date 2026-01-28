interface User {
    avatar: string,
    blocked: string[] | [],
    email: string,
    id: string,
    username: string,
    status: string
}

interface UserChat {
    chatId: string,
    lastMessage: string | null,
    receiverId?: string, // for private chats
    isSeen?: boolean,
    updatedAt?: number,
    unreadCount?: number, // NEW: count of unread messages
    type: 'private' | 'group' | 'global',
    groupName?: string, // for group chats
    groupPhotoURL?: string, // for group chats
    participants?: string[], // NEW: array of participant user IDs for group chats
    admins?: string[], // NEW: array of admin user IDs for group chats
    createdBy?: string, // NEW: user ID who created the group
    createdAt?: number, // NEW: timestamp when chat was created
}

interface Message {
    id: string;
    senderId: string;
    senderAvatar?: string; // for group/global chats
    senderUsername?: string; // for group/global chats
    text: string;
    img?: string;
    createdAt: {
        toDate: () => Date;
    };
    readBy?: string[]; // NEW: array of user IDs who have read this message
}

interface Avatar {
    file: File | null,
    url: string
}

type UserChatDocWithReceiverInfo = UserChat & { user: User };