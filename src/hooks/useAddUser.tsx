import { collection, doc, setDoc, serverTimestamp, updateDoc, arrayUnion, getDocs, query, where, getDoc } from "firebase/firestore";
import { FormEvent, useState } from "react";
import { db } from "../lib/firebase";
import { useUserStore } from "../lib/userStore";

export const useAddUser = () => {

    const { currentUser } = useUserStore();

    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [addingUserId, setAddingUserId] = useState<string | null>(null);

    const searchUser = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.target as HTMLFormElement);
        const username = formData.get("username");

        try {
            const userRef = collection(db, "users");
            const userQuery = query(
                userRef,
                where("username", ">=", username),
                where("username", "<=", username + '\uf8ff'),
                where("username", "!=", currentUser.username)
            );

            const querySnapshot = await getDocs(userQuery);

            if (!querySnapshot.empty) {
                const allUsers = await Promise.all(querySnapshot.docs.map(async (doc) => {
                    const user = doc.data();
                    const isAdded = await checkIfUserIsAlreadyAdded(user.id);
                    return { ...user, isAdded };
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
                    receiverId: currentUser.id
                })
            });

            await updateDoc(doc(userChatsRef, currentUser.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: user.id
                })
            });

        } catch (err) {
            console.log(err);
        } finally {
            setAddingUserId(null);
        }
    };

    const checkIfUserIsAlreadyAdded = async (userId: string) => {
        const userChatsRef = doc(db, "userchats", currentUser.id);
        const userChatsDoc = await getDoc(userChatsRef);
        if (userChatsDoc.exists()) {
            const userChats = userChatsDoc.data().chats;
            return userChats.some((chat: Chat) => chat.receiverId === userId);
        } else {
            return false;
        }
    };

    return { users, isLoading, addingUserId, addUser, searchUser };
}