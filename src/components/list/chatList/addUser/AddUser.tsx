import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { useState } from "react";
import { db } from "../../../../lib/firebase";
import { useUserStore } from "../../../../lib/userStore";

export const AddUser = () => {

    const { currentUser } = useUserStore();

    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAddingUser, setIsAddingUser] = useState(false);

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.target as HTMLFormElement);
        const username = formData.get("username");

        try {
            const userRef = collection(db, "users");
            const userQuery = query(userRef, where("username", ">=", username), where("username", "<=", username + '\uf8ff'));

            const querySnapshot = await getDocs(userQuery);

            if (!querySnapshot.empty) {
                setUsers(querySnapshot.docs.map(doc => doc.data()));
            } else {
                setUsers([]);
            }
        } catch (err) {
            console.log(err)
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddUser = async (user: any) => {
        
        const chatRef = collection(db, "chats");
        const userChatsRef = collection(db, "userchats");
        setIsAddingUser(true);

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
            setIsAddingUser(false);
        }
    };

    return (
        <div className="absolute inset-0 w-max h-max m-auto p-7 bg-neutral-900 rounded-lg">
            <form className="flex gap-5" onSubmit={handleSearch}>
                <input type="text" placeholder="Username" name="username" className="bg-neutral-800 p-3 rounded-lg border-none outline-none" />
                <button className="bg-blue-900 py-3 px-4 rounded-lg w-max relative flex items-center">
                    <span className={`${isLoading ? 'visible' : 'invisible'} absolute inset-x-0 mb-2`}>...</span>
                    <span className={!isLoading ? 'visible' : 'invisible'}>Search</span>
                </button>
            </form>
            {
                users.length > 0 &&
                <div className="mt-12">
                    {users.map(user => (
                        <div key={user.id} className="flex justify-between items-center mt-4">
                            <div className="flex items-center gap-5">
                                <img src={user.avatar || '/img/avatar-placeholder.png'} alt="" className="w-14 h-14 rounded-full object-cover" />
                                <span>{user.username}</span>
                            </div>
                            <button className="bg-blue-900 py-2 px-3 rounded-lg relative" onClick={() => handleAddUser(user)}>
                                <span className={`${isAddingUser ? 'visible' : 'invisible'} absolute inset-x-0 mb-2`}>...</span>
                                <span className={!isAddingUser ? 'visible' : 'invisible'}>Add User</span>
                            </button>
                        </div>
                    ))}
                </div>
            }
        </div>
    )
}
