import { IconSearch } from "../../icons/IconSearch"
import { useUserStore } from "../../../lib/userStore";
import { UserPlusIcon, UserGroupIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import AddUser from "./addUser/AddUser";
import CreateGroup from "./createGroup/CreateGroup";
import { useChatList } from "../../../hooks/useChatList";
import { useChatStore } from "../../../lib/chatStore";
import { useAppStateStore } from "../../../lib/appStateStore";
import { useGlobalChatLastMessage } from "../../../hooks/useGlobalChatLastMessage";
import { UserInfo } from "../userInfo/UserInfo";
import { useState } from "react";
import { Avatar, GroupAvatar } from "../../ui/Avatar";
import { useChatTypingStatus } from "../../../hooks/chat/useTypingIndicator";
import { GLOBAL_CHAT_ID } from "../../../hooks/useSignup";
import { motion, AnimatePresence } from "framer-motion";
import { ChatListSkeleton } from "../../ui/Skeleton";

export const ChatList = () => {

    const { setInput, filteredChats, globalChat, hasPersonalChats, handleSelectChat } = useChatList();
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
    
    // boolean value to open messaging area
    const { setIsChatOpen } = useAppStateStore();

    const handleChatClick = (chat: UserChatDocWithReceiverInfo) => {
        handleSelectChat(chat)
        setIsChatOpen(true)
    }

    return (
        <div className="flex-1 overflow-hidden">
            <div className="sticky top-0 frosted-glass z-10">
                <UserInfo />
                <div className="flex items-center gap-5 p-5">
                    <SearchBar setInput={setInput} />
                    <div className="flex items-center gap-3">
                        <CreateGroupButton setIsOpen={setIsCreateGroupOpen} />
                        <AddUserButton setIsOpen={setIsAddUserOpen} />
                    </div>
                </div>
            </div>
            <div className="overflow-hidden">
                <GlobalChatItem chat={globalChat} onClick={handleChatClick} />
                {!hasPersonalChats && (
                    <WelcomeGuide
                        onNewMessage={() => setIsAddUserOpen(true)}
                        onCreateGroup={() => setIsCreateGroupOpen(true)}
                    />
                )}
                <AnimatePresence mode="popLayout">
                    {filteredChats ? (
                        filteredChats.map((chat, index) => (
                            <motion.div
                                key={chat.chatId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ 
                                    duration: 0.2, 
                                    delay: index * 0.03,
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 25
                                }}
                            >
                                <ListItem chat={chat} onClick={handleChatClick} isLoading={filteredChats.length === 0} />
                            </motion.div>
                        ))
                    ) : (
                        <ChatListSkeleton />
                    )}
                </AnimatePresence>
            </div>
            <AddUser isOpen={isAddUserOpen} setIsOpen={setIsAddUserOpen} />
            <CreateGroup isOpen={isCreateGroupOpen} setIsOpen={setIsCreateGroupOpen} />
        </div>
    )
}

const WelcomeGuide = ({
    onNewMessage,
    onCreateGroup,
}: {
    onNewMessage: () => void;
    onCreateGroup: () => void;
}) => (
    <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="m-4 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4"
        aria-labelledby="welcome-guide-title"
    >
        <div className="flex items-start gap-3">
            <ChatBubbleLeftRightIcon className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" aria-hidden="true" />
            <div className="min-w-0">
                <h2 id="welcome-guide-title" className="text-sm font-semibold text-blue-50">Welcome to Buzz</h2>
                <p className="mt-1 text-xs leading-5 text-blue-100/70">
                    Global Buzz is ready. Start a private chat or bring people together in a group.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={onNewMessage}
                        className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-500"
                    >
                        <UserPlusIcon className="h-4 w-4" aria-hidden="true" />
                        New message
                    </button>
                    <button
                        type="button"
                        onClick={onCreateGroup}
                        className="inline-flex items-center gap-1.5 rounded-md border border-blue-300/20 px-3 py-2 text-xs font-medium text-blue-100 transition-colors hover:bg-blue-400/10"
                    >
                        <UserGroupIcon className="h-4 w-4" aria-hidden="true" />
                        Create group
                    </button>
                </div>
            </div>
        </div>
    </motion.section>
);


const ListItem = ({ chat, onClick, isLoading }: { chat: any, onClick: (chat: any) => void, isLoading: boolean }) => {
    const { currentUser } = useUserStore();
    const { isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
    const { isTyping, typingText } = useChatTypingStatus(chat.chatId);
    const unreadCount = chat.unreadCount || 0;
    
    // Check if it's a group chat
    const isGroupChat = chat.type === 'group';
    
    if (isGroupChat) {
        return <GroupChatItem chat={chat} onClick={onClick} isLoading={isLoading} />;
    }
    
    // Regular 1-on-1 chat
    const sender = chat.user;
    const userBlocked = sender.blocked.includes(currentUser.id) || currentUser.blocked.includes(sender.id) || isCurrentUserBlocked || isReceiverBlocked;
    const lastMessagePreview = chat.lastMessage;
    
    // Only show unread highlight if there's actually an unread message (not just a new empty chat)
    const hasUnreadMessage = !chat.isSeen && unreadCount > 0 && !!chat.lastMessage;

    return (
        <motion.div 
            onClick={() => onClick(chat)} 
            className="flex items-center gap-5 p-5 cursor-pointer border-b border-b-gray-800 relative overflow-hidden hover:bg-neutral-800/50 transition-colors"
            style={{
                backgroundColor: hasUnreadMessage ? 'rgba(255, 255, 255, 0.1)' : undefined
            }}
            whileTap={{ scale: 0.98 }}
        >
            {!isLoading ? (
                <Avatar 
                    src={userBlocked ? null : sender.avatar}
                    name={sender.username}
                    size="md"
                    className="min-w-12 max-w-12 shrink-0"
                />
            ) : (
                <div className="size-12 rounded-full bg-gradient-to-r from-gray-800 via-slate-800 to-gray-800 animate-pulse opacity-50 shrink-0" />
            )}
            <div className="flex-1 min-w-0 overflow-hidden">
                {!isLoading ?
                    (<>
                        <h2 className="truncate">{sender.username}</h2>
                        {isTyping ? (
                            <p className="text-blue-400 text-sm italic truncate">{typingText}</p>
                        ) : (
                            <p className="text-neutral-500 truncate">{lastMessagePreview}</p>
                        )}
                    </>) : (
                        <div className="opacity-50">
                            <div className="w-[90px] h-4 bg-gradient-to-r from-gray-800 via-slate-800 to-gray-800 animate-pulse my-2 rounded-full" />
                            <div className="w-[200px] h-5 bg-gradient-to-r  from-gray-800 via-slate-800 to-gray-800 animate-pulse my-2 rounded-full" />
                        </div>
                    )
                }
            </div>
            {/* Unread count badge */}
            {unreadCount > 0 && (
                <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center justify-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white min-w-[1.25rem]"
                >
                    {unreadCount > 99 ? '99+' : unreadCount}
                </motion.span>
            )}
        </motion.div>
    )
}

const GroupChatItem = ({ chat, onClick, isLoading }: { chat: any, onClick: (chat: any) => void, isLoading: boolean }) => {
    const { isTyping, typingText } = useChatTypingStatus(chat.chatId);
    const lastMessagePreview = chat.lastMessage;
    const unreadCount = chat.unreadCount || 0;
    const groupName = chat.groupName || 'Unnamed Group';
    const groupPhoto = chat.groupPhotoURL;
    
    // Only show unread highlight if there's actually an unread message
    const hasUnreadMessage = !chat.isSeen && unreadCount > 0 && !!chat.lastMessage;

    return (
        <motion.div 
            onClick={() => onClick(chat)} 
            className="flex items-center gap-5 p-5 cursor-pointer border-b border-b-gray-800 relative overflow-hidden hover:bg-neutral-800/50 transition-colors"
            style={{
                backgroundColor: hasUnreadMessage ? 'rgba(255, 255, 255, 0.1)' : undefined
            }}
            whileTap={{ scale: 0.98 }}
        >
            {!isLoading ? (
                <GroupAvatar 
                    src={groupPhoto}
                    name={groupName}
                    size="md"
                    className="min-w-12 max-w-12 shrink-0"
                />
            ) : (
                <div className="size-12 rounded-full bg-gradient-to-r from-gray-800 via-slate-800 to-gray-800 animate-pulse opacity-50 shrink-0" />
            )}
            
            <div className="flex-1 min-w-0 overflow-hidden">
                {!isLoading ? (
                    <>
                        <h2 className="truncate">{groupName}</h2>
                        {isTyping ? (
                            <p className="text-blue-400 text-sm italic truncate">{typingText}</p>
                        ) : (
                            <p className="text-neutral-500 truncate">{lastMessagePreview || 'No messages yet'}</p>
                        )}
                    </>
                ) : (
                    <div className="opacity-50">
                        <div className="w-[90px] h-4 bg-gradient-to-r from-gray-800 via-slate-800 to-gray-800 animate-pulse my-2 rounded-full" />
                        <div className="w-[200px] h-5 bg-gradient-to-r from-gray-800 via-slate-800 to-gray-800 animate-pulse my-2 rounded-full" />
                    </div>
                )}
            </div>
            
            {/* Unread count badge */}
            {unreadCount > 0 && (
                <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center justify-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white min-w-[1.25rem]"
                >
                    {unreadCount > 99 ? '99+' : unreadCount}
                </motion.span>
            )}
        </motion.div>
    );
};

interface GlobalChatProps {
    chat: any,
    onClick: (chat: any) => void
}

const GlobalChatItem = ({ chat, onClick }: GlobalChatProps) => {

    const { isLoading, lastMessage } = useGlobalChatLastMessage();
    const { isTyping, typingText } = useChatTypingStatus(GLOBAL_CHAT_ID);
    const unreadCount = chat?.unreadCount || 0;
    
    // Only show unread highlight if there's actually an unread message
    const hasUnreadMessage = !chat?.isSeen && unreadCount > 0 && !!lastMessage;

    return (
        <motion.div 
            onClick={() => onClick(chat)} 
            className="flex items-center gap-5 p-5 cursor-pointer border-b border-b-gray-800 relative overflow-hidden hover:bg-neutral-800/50 transition-colors"
            style={{
                backgroundColor: hasUnreadMessage ? 'rgba(255, 255, 255, 0.1)' : undefined
            }}
            whileTap={{ scale: 0.98 }}
        >
            {!isLoading ? (
                <Avatar 
                    src={null}
                    name="Global Buzz"
                    size="md"
                    className="min-w-12 max-w-12 shrink-0"
                />
            ) : (
                <div className="size-12 rounded-full bg-gradient-to-r from-gray-800 via-slate-800 to-gray-800 animate-pulse opacity-50 shrink-0" />
            )}
            <div className="flex-1 min-w-0 overflow-hidden">
                {!isLoading ?
                    (<>
                        <h2 className="truncate">Global Buzz</h2>
                        {isTyping ? (
                            <p className="text-blue-400 text-sm italic truncate">{typingText}</p>
                        ) : (
                            <p className="text-neutral-500 truncate">{lastMessage?.senderUsername}: {lastMessage?.text ?? 'Welcome to buzz global chat'}</p>
                        )}
                    </>) : (
                        <div className="opacity-50">
                            <div className="w-[90px] h-4 bg-gradient-to-r from-gray-800 via-slate-800 to-gray-800 animate-pulse my-2 rounded-full" />
                            <div className="w-[200px] h-5 bg-gradient-to-r  from-gray-800 via-slate-800 to-gray-800 animate-pulse my-2 rounded-full" />
                        </div>
                    )
                }
            </div>
            {/* Unread count badge */}
            {unreadCount > 0 && (
                <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center justify-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white min-w-[1.25rem]"
                >
                    {unreadCount > 99 ? '99+' : unreadCount}
                </motion.span>
            )}
        </motion.div>
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

const CreateGroupButton = ({ setIsOpen }: { setIsOpen: (isOpen: boolean) => void }) => {
    return (
        <button onClick={() => setIsOpen(true)} className="cursor-pointer" title="Create Group">
            <UserGroupIcon className="text-white size-6" />
        </button>
    )
}

const AddUserButton = ({ setIsOpen }: { setIsOpen: (isOpen: boolean) => void }) => {
    return (
        <button onClick={() => setIsOpen(true)} className="cursor-pointer" title="Add User">
            <UserPlusIcon className="text-white size-6" />
        </button>
    )
}

