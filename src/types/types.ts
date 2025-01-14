interface User {
    avatar: string,
    blocked: string[] | [],
    email: string,
    id: string,
    usernname: string
}

interface Chat {
    chatId: string,
    lastMessage: string,
    receiverId: string,
    isSeen: boolean
}