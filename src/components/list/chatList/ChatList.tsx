import { useEffect, useState } from "react";
import { IconSearch } from "../../icons/IconSearch"
import { db } from "../../../lib/firebase";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useUserStore } from "../../../lib/userStore";
import { useChatStore } from "../../../lib/chatStore";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import AddUser from "./addUser/AddUser";


export const ChatList = () => {

    const [isOpen, setIsOpen] = useState(false);
    const [chats, setChats] = useState<any[]>([]);
    const [input, setInput] = useState('');

    const filteredChats = chats.filter((chat) => chat.user.username.toLowerCase().includes(input.toLowerCase()));

    const { currentUser } = useUserStore();
    const { changeChat, resetChat, chatId } = useChatStore();

    useEffect(() => {
        const unsub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
            const data = res.data();
            const items = data ? data.chats : [];
            const promises = items.map(async (item: any) => {
                const userDocRef = doc(db, "users", item.receiverId);
                const userDocSnap = await getDoc(userDocRef);

                const user = userDocSnap.data();

                return { ...item, user };
            })

            const chatData = await Promise.all(promises);
            setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
        });
        return () => unsub();
    }, [currentUser.id]);

    const handleSelectChat = async (chat: any) => {
        if(chatId === chat.chatId) return;

        resetChat();

        const userChats = chats.map((item) => {
            const { user, ...rest } = item;
            return rest;
        });

        const chatIndex = userChats.findIndex((item) => item.chatId === chat.chatId);

        userChats[chatIndex].isSeen = true;

        const userChatsRef = doc(db, "userchats", currentUser.id);

        try {
            await updateDoc(userChatsRef, {
                chats: userChats,
            });
            changeChat(chat.chatId, chat.user);
        } catch (err) {
            console.log(err);
        };
    };

    return (
        <div className="flex-1 overflow-y-scroll">
            <div className="flex items-center gap-5 p-5">
                <div className="flex-1 bg-neutral-900 flex items-center gap-5 p-2 rounded-lg">
                    <IconSearch />
                    <input type="text" placeholder="Search" 
                        onChange={(e) => setInput(e.target.value)}
                        className="bg-transparent border-none outline-none text-white" 
                    />
                </div>
                <button onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
                    <UserPlusIcon className="text-white size-6" />
                </button>
            </div>

            {
               chats && 
                filteredChats.map((chat) => (
                    <ListItem key={chat.chatId} chat={chat} onClick={() => handleSelectChat(chat)} />
                ))
            }

            <>
                <AddUser isOpen={isOpen} setIsOpen={setIsOpen} />
            </>
        </div>
    )
}


const ListItem = ({ chat, onClick }: { chat: any, onClick: () => void }) => {
    const sender = chat.user;
    const { currentUser } = useUserStore();
    const userBlocked = sender.blocked.includes(currentUser.id);
    const lastMessagePreview = chat.lastMessage.slice(0, 30);
    
    return (
        <div onClick={onClick} className="flex items-center gap-5 p-5 cursor-pointer border-b border-b-gray-800"
            style={{
                backgroundColor: chat.isSeen ? 'transparent' : 'rgba(255, 255, 255, 0.1)'    
            }}
        >
            <img src={ userBlocked ? './img/avatar-placeholder.png' : sender.avatar } alt="user" className="w-12 h-12 rounded-full object-cover" />
            <div>
                <h2>{ userBlocked ? 'User' : sender.username }</h2>
                <p className="text-neutral-500">{ lastMessagePreview }{ lastMessagePreview.length >= 30 ? '...' : '' }</p>
            </div>
        </div>
    )
}
