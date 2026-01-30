import { collection, doc, setDoc, serverTimestamp, updateDoc, arrayUnion, getDocs, query, where, getDoc } from "firebase/firestore";
import { useState } from "react";
import { db } from "../lib/firebase";
import { useUserStore } from "../lib/userStore";
import { useChatStore } from "../lib/chatStore";

export const useAddUser = (onUserAdded?: () => void) => {

    const { currentUser } = useUserStore();
    const { changeChat } = useChatStore();

    const [users, setUsers] = useState<(User & { isAdded: boolean; chatId?: string })[]>([]);
    const [filterInput, setFilterInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [addingUserId, setAddingUserId] = useState<string | null>(null);
    const filteredUsers = users.filter((user) => user.username.toLowerCase().includes(filterInput.toLowerCase()));

    // const searchUser = async (username: string) => {
    //     try {
    //         const userRef = collection(db, "users");
    //         const userQuery = query(
    //             userRef,
    //             where("username", ">=", username),
    //             where("username", "<=", username + '\uf8ff'),
    //             where("username", "!=", currentUser.username)
    //         );

    //         const querySnapshot = await getDocs(userQuery);

    //         if (!querySnapshot.empty) {
    //             const allUsers = await Promise.all(querySnapshot.docs.map(async (doc) => {
    //                 const user = doc.data();
    //                 const isAdded = await checkIfUserIsAlreadyAdded(user.id);
    //                 return { ...user, isAdded };
    //             }));
    //             setUsers(allUsers);
    //         } else {
    //             setUsers([]);
    //         }
    //     } catch (err) {
    //         console.log(err);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    // const searchUser = async (username: string) => {
        
    // }

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const userRef = collection(db, "users");
            const userQuery = query(userRef, where("username", "!=", currentUser.username));

            const querySnapshot = await getDocs(userQuery);

            if (!querySnapshot.empty) {
                const allUsers = await Promise.all(querySnapshot.docs.map(async (doc) => {
                    const user = doc.data() as User;
                    const existingChat = await getExistingChatWithUser(user.id);
                    return { 
                        ...user, 
                        isAdded: !!existingChat,
                        chatId: existingChat?.chatId 
                    };
                }));
                setUsers(allUsers);
            } else {
                setUsers([]);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    };

    const getExistingChatWithUser = async (userId: string): Promise<{ chatId: string } | null> => {
        const userChatsRef = doc(db, "userchats", currentUser.id);
        const userChatsDoc = await getDoc(userChatsRef);
        if (userChatsDoc.exists()) {
            const userChats = userChatsDoc.data().chats;
            const existingChat = userChats.find((chat: UserChat) => chat.receiverId === userId);
            return existingChat ? { chatId: existingChat.chatId } : null;
        }
        return null;
    };

    const addUser = async (user: User) => {
        setAddingUserId(user.id);
        const chatRef = collection(db, "chats");
        const userChatsRef = collection(db, "userchats");

        try {
            const newChatRef = doc(chatRef);

            await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: [],
            });

            await updateDoc(doc(userChatsRef, user.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: currentUser.id,
                    isSeen: true,
                    unreadCount: 0,
                    updatedAt: Date.now()
                })
            });

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

            // Open the chat immediately after adding
            changeChat(newChatRef.id, user);
            
            // Callback to close modal
            onUserAdded?.();

            fetchUsers();

        } catch (err) {
            console.log(err);
        } finally {
            setAddingUserId(null);
        }
    };

    // Open an existing chat with a user
    const openExistingChat = (user: User & { chatId?: string }) => {
        if (user.chatId) {
            changeChat(user.chatId, user);
            onUserAdded?.();
        }
    };

    return { isLoading, addingUserId, addUser, openExistingChat, fetchUsers, setFilterInput, filteredUsers };
}