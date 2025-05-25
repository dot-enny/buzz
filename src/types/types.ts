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
    lastMessage: string,
    receiverId: string,
    isSeen: boolean
}

interface Avatar {
    file: File | null,
    url: string
}

type UserChatDocWithReceiverInfo = UserChat & { user: User };