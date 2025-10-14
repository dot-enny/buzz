import { IconSearch } from "../../icons/IconSearch"
import { useUserStore } from "../../../lib/userStore";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import AddUser from "./addUser/AddUser";
import { useChatList } from "../../../hooks/useChatList";
import { useChatStore } from "../../../lib/chatStore";
import { useAppStateStore } from "../../../lib/appStateStore";
import { useGlobalChatLastMessage } from "../../../hooks/useGlobalChatLastMessage";
import { UserInfo } from "../userInfo/UserInfo";

export const ChatList = () => {

    const { isOpen, setIsOpen, setInput, filteredChats, globalChat, handleSelectChat } = useChatList();
    // boolean value to open messaging area
    const { setIsChatOpen } = useAppStateStore();

    const handleChatClick = (chat: UserChatDocWithReceiverInfo) => {
        handleSelectChat(chat)
        setIsChatOpen(true)
    }

    return (
        <div className="flex-1">
            <div className="fixed bg-neutral-950">
                <UserInfo />
                <div className="flex items-center gap-5 p-5">
                    <SearchBar setInput={setInput} />
                    <AddUserButton setIsOpen={setIsOpen} />
                </div>
            </div>
            <div className="pt-40">
                <GlobalChatItem chat={globalChat} onClick={handleChatClick} />
                {
                    filteredChats ?
                        filteredChats.map((chat) => (
                            <ListItem key={chat.chatId} chat={chat} onClick={handleChatClick} isLoading={filteredChats.length === 0} />
                        )) : <div className="text-white text-6xl">Loading...</div>
                }
            </div>
            <AddUser isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
    )
}


const ListItem = ({ chat, onClick, isLoading }: { chat: any, onClick: (chat: any) => void, isLoading: boolean }) => {
    const sender = chat.user;
    const { currentUser } = useUserStore();
    const { isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
    const userBlocked = sender.blocked.includes(currentUser.id) || currentUser.blocked.includes(sender.id) || isCurrentUserBlocked || isReceiverBlocked;
    const lastMessagePreview = chat.lastMessage;

    return (
        <div onClick={() => onClick(chat)} className="flex items-center gap-5 p-5 cursor-pointer border-b border-b-gray-800 relative"
            style={{
                backgroundColor: chat.isSeen ? 'transparent' : 'rgba(255, 255, 255, 0.1)'
            }}
        >            {!isLoading ?
            <img
                src={userBlocked || !sender.avatar ? '/img/avatar-placeholder.png' : sender.avatar}
                alt="user"
                className="min-w-12 max-w-12 h-12 rounded-full object-cover" /> :
            <div className="size-12 rounded-full bg-gradient-to-r  from-gray-800 via-slate-800 to-gray-800 animate-pulse opacity-50" />
            }
            <div>
                {!isLoading ?
                    (<>
                        <h2>{sender.username}</h2>
                        <p className="text-neutral-500 line-clamp-1">{lastMessagePreview}</p>
                    </>) : (
                        <div className="opacity-50">
                            <div className="w-[90px] h-4 bg-gradient-to-r from-gray-800 via-slate-800 to-gray-800 animate-pulse my-2 rounded-full" />
                            <div className="w-[200px] h-5 bg-gradient-to-r  from-gray-800 via-slate-800 to-gray-800 animate-pulse my-2 rounded-full" />
                        </div>
                    )
                }
            </div>
            {/* { !chat.isSeen && <span className="absolute z-20 text-white flex items-center justify-center top-4 right-4 rounded-full bg-blue-900 size-6 text-xs">{chat.unread}</span> } */}
        </div>
    )
}

interface GlobalChatProps {
    chat: any,
    onClick: (chat: any) => void
}

const GlobalChatItem = ({ chat, onClick }: GlobalChatProps) => {

    const { isLoading, lastMessage } = useGlobalChatLastMessage();

    return (<div onClick={() => onClick(chat)} className="flex items-center gap-5 p-5 cursor-pointer border-b border-b-gray-800">
        {!isLoading ?
            <img
                src="/img/avatar-placeholder.png"
                alt="user"
                className="min-w-12 max-w-12 h-12 rounded-full object-cover" /> :
            <div className="size-12 rounded-full bg-gradient-to-r  from-gray-800 via-slate-800 to-gray-800 animate-pulse opacity-50" />
        }
        <div>
            {!isLoading ?
                (<>
                    <h2>Global Buzz</h2>
                    <p className="text-neutral-500 line-clamp-1">{lastMessage?.senderUsername}: {lastMessage?.text ?? 'Welcome to buzz global chat'}</p>
                </>) : (
                    <div className="opacity-50">
                        <div className="w-[90px] h-4 bg-gradient-to-r from-gray-800 via-slate-800 to-gray-800 animate-pulse my-2 rounded-full" />
                        <div className="w-[200px] h-5 bg-gradient-to-r  from-gray-800 via-slate-800 to-gray-800 animate-pulse my-2 rounded-full" />
                    </div>
                )
            }
        </div>
    </div>
    )
}

const SearchBar = ({ setInput }: { setInput: (input: string) => void }) => {
    return (
        <div className="flex-1 bg-neutral-900 flex items-center gap-2 px-3 py-2 rounded-lg">
            {/* <span className="ml-2"> */}
            <IconSearch />
            {/* </span> */}
            <input type="text" placeholder="Search"
                onChange={(e) => setInput(e.target.value)}
                className="bg-transparent border-none outline-none text-white w-full"
            />
        </div>
    )
}

const AddUserButton = ({ setIsOpen }: { setIsOpen: (isOpen: boolean) => void }) => {
    return (
        <button onClick={() => setIsOpen(true)} className="cursor-pointer">
            <UserPlusIcon className="text-white size-6" />
        </button>
    )
}

