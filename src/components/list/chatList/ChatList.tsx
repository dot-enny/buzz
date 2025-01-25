import { IconSearch } from "../../icons/IconSearch"
import { useUserStore } from "../../../lib/userStore";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import AddUser from "./addUser/AddUser";
import { useChatList } from "../../../hooks/useChatList";
import { useChatStore } from "../../../lib/chatStore";
import { useAppStateStore } from "../../../lib/appStateStore";


export const ChatList = () => {

    const { isOpen, setIsOpen, chats, setInput, filteredChats, handleSelectChat } = useChatList();
    const { setIsChatOpen } = useAppStateStore();

    const handleChatClick = (chat: any) => {
        handleSelectChat(chat)
        setIsChatOpen(true)
        console.log(chat)
    }

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="flex items-center gap-5 p-5">
                <div className="flex-1 bg-neutral-900 flex items-center gap-5 p-2 rounded-lg">
                    <IconSearch />
                    <input type="text" placeholder="Search" 
                        onChange={(e) => setInput(e.target.value)}
                        className="bg-transparent border-none outline-none text-white w-full" 
                    />
                </div>
                <button onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
                    <UserPlusIcon className="text-white size-6" />
                </button>
            </div>
            {
               chats && 
                filteredChats.map((chat) => (
                    <ListItem key={chat.chatId} chat={chat} onClick={handleChatClick} />
                ))
            }
            <AddUser isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
    )
}


const ListItem = ({ chat, onClick }: { chat: any, onClick: (chat: any) => void }) => {
    const sender = chat.user;
    const { currentUser } = useUserStore();
    const { isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
    const userBlocked = sender.blocked.includes(currentUser.id) || currentUser.blocked.includes(sender.id) || isCurrentUserBlocked || isReceiverBlocked;
    const lastMessagePreview = chat.lastMessage.slice(0, 30);
    
    return (
        <div onClick={() => onClick(chat)} className="flex items-center gap-5 p-5 cursor-pointer border-b border-b-gray-800"
            style={{
                backgroundColor: chat.isSeen ? 'transparent' : 'rgba(255, 255, 255, 0.1)'    
            }}
        >
            <img src={ userBlocked ? './img/avatar-placeholder.png' : sender.avatar } alt="user" className="w-12 h-12 rounded-full object-cover" />
            <div>
                <h2>{ sender.username }</h2>
                <p className="text-neutral-500">{ lastMessagePreview }{ lastMessagePreview.length >= 30 ? '...' : '' }</p>
            </div>
        </div>
    )
}
