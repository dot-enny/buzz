import { useEffect, useState } from "react";
import { IconPlus } from "../../icons/IconPlus"
import { IconSearch } from "../../icons/IconSearch"
import { IconMinus } from "../../icons/IconMinus";
import { AddUser } from "./addUser/AddUser";
import { db } from "../../../lib/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useUserStore } from "../../../lib/userStore";
import { useChatStore } from "../../../lib/chatStore";

export const ChatList = () => {

    const [addMode, setAddMode] = useState(false);
    const [chats, setChats] = useState<any[]>([]);
    const { currentUser } = useUserStore();
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

    return (
        <div className="flex-1 overflow-y-scroll">
            <div className="flex items-center gap-5 p-5">
                <div className="flex-1 bg-neutral-900 flex items-center gap-5 p-2 rounded-lg">
                    <IconSearch />
                    <input type="text" placeholder="Search" className="bg-transparent border-none outline-none text-white" />
                </div>
                <div onClick={() => setAddMode((prev) => !prev)} className="cursor-pointer">
                    {addMode ? <IconMinus /> : <IconPlus />}
                </div>
            </div>
            {
               chats && 
                chats.map((chat) => (
                    <ListItem key={chat.chatId} chat={chat} />
                ))
            }

            <>
                { addMode && <AddUser /> }
            </>
        </div>
    )
}


const ListItem = ({ chat }: { chat: any }) => {
    const sender = chat.user;
    return (
        <div className="flex items-center gap-5 p-5 cursor-pointer border-b border-b-gray-800">
            <img src={ sender.avatar || './img/avatar-placeholder.png'} alt="user" className="w-12 h-12 rounded-full object-cover" />
            <div>
                <h2>{ sender.username }</h2>
                <p className="text-neutral-500">{ chat.lastMessage }</p>
            </div>
        </div>
    )
}
