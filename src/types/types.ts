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
    type: 'private' | 'group' | 'global',
    groupName?: string, // for group chats
    groupPhotoURL?: string, // for group chats
}

interface Avatar {
    file: File | null,
    url: string
}

type UserChatDocWithReceiverInfo = UserChat & { user: User };