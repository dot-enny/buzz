import { collection, getDocs, query, where, getDoc, doc } from "firebase/firestore";
import { useState } from "react";
import { db } from "../lib/firebase";
import { useUserStore } from "../lib/userStore";
import { useChatStore } from "../lib/chatStore";

export interface UserWithChatInfo extends User {
    chatId?: string;
    isAdded: boolean;
}

const INITIAL_USERS_LIMIT = 20;

export const useAddUser = (onChatOpened?: () => void) => {
    const { currentUser } = useUserStore();
    const { changeChat } = useChatStore();

    const [allUsers, setAllUsers] = useState<UserWithChatInfo[]>([]);
    const [filterInput, setFilterInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    // Filter users based on search input
    const getFilteredUsers = (): UserWithChatInfo[] => {
        if (!filterInput.trim()) {
            // No search: show unadded users only (limited)
            return allUsers
                .filter(user => !user.isAdded)
                .slice(0, INITIAL_USERS_LIMIT);
        }
        
        // With search: show ALL matching users (added and unadded)
        return allUsers.filter(user => 
            user.username.toLowerCase().includes(filterInput.toLowerCase())
        );
    };

    const filteredUsers = getFilteredUsers();

    // Fetch all users (except current user)
    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const userRef = collection(db, "users");
            const userQuery = query(userRef, where("username", "!=", currentUser.username));
            const querySnapshot = await getDocs(userQuery);

            if (!querySnapshot.empty) {
                const users = await Promise.all(querySnapshot.docs.map(async (docSnap) => {
                    const user = docSnap.data() as User;
                    const existingChatId = await getExistingChatId(user.id);
                    return { 
                        ...user, 
                        chatId: existingChatId,
                        isAdded: !!existingChatId
                    };
                }));
                
                // Sort: unadded users first, then added users
                users.sort((a, b) => {
                    if (a.isAdded === b.isAdded) return 0;
                    return a.isAdded ? 1 : -1;
                });
                
                setAllUsers(users);
            } else {
                setAllUsers([]);
            }
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Check if there's an existing chat with this user
    const getExistingChatId = async (userId: string): Promise<string | undefined> => {
        try {
            const userChatsRef = doc(db, "userchats", currentUser.id);
            const userChatsDoc = await getDoc(userChatsRef);
            if (userChatsDoc.exists()) {
                const userChats = userChatsDoc.data().chats || [];
                const existingChat = userChats.find((chat: UserChat) => chat.receiverId === userId);
                return existingChat?.chatId;
            }
        } catch (err) {
            console.error("Error checking existing chat:", err);
        }
        return undefined;
    };

    // Open a chat with a user
    const openChat = (user: UserWithChatInfo) => {
        if (user.chatId) {
            // Open existing chat
            changeChat(user.chatId, user);
        } else {
            // Open a temporary chat
            const tempChatId = `temp_${user.id}`;
            changeChat(tempChatId, user);
        }
        onChatOpened?.();
    };

    return { 
        fetchUsers, 
        openChat, 
        isLoading, 
        filteredUsers, 
        setFilterInput,
        filterInput,
        totalUnadded: allUsers.filter(u => !u.isAdded).length
    };
};