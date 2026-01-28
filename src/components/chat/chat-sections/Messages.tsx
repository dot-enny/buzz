import { useChatStore } from "../../../lib/chatStore";
import { format } from "timeago.js";
import { useUserStore } from "../../../lib/userStore";
import { useUpdateMessages } from "../../../hooks/chat/useUpdateMessages";
import React from "react";
import { Spinner } from "../../ui/Spinner";
import { motion } from "framer-motion";
import { classNames } from "../../../utils/helpers";
import { CheckIcon } from "@heroicons/react/24/outline";
import { groupMessagesByDate } from "../../../utils/dateHelpers";

interface MessageProps {
    id: string;
    senderId: string;
    senderAvatar?: string;
    senderUsername?: string;
    text: string;
    img?: string;
    createdAt: {
        toDate: () => Date;
    };
    readBy?: string[];
}

export const Messages = () => {
    const { messages, endRef } = useUpdateMessages();
    const messagesToAnimate = 5; // Number of messages to animate

    // Group messages by date
    const groupedMessages = messages ? groupMessagesByDate(messages) : [];

    return (
        <div className="center flex-1 p-5 overflow-scroll flex flex-col gap-5">
            {messages ? (
                <>
                    {groupedMessages.map((group: { date: string; messages: any[] }) => (
                        <div key={group.date} className="flex flex-col gap-5">
                            {/* Date Separator */}
                            <DateSeparator date={group.date} />

                            {/* Messages for this date */}
                            {group.messages.map((message: MessageProps) => {
                                const globalIndex = messages.findIndex((m: any) => m.id === message.id);
                                return (
                                    <Message
                                        key={message.id || message.createdAt.toDate().toISOString()}
                                        message={message}
                                        index={globalIndex}
                                        animate={globalIndex >= messages.length - messagesToAnimate}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </>
            ) : (
                <div className="absolute inset-0 m-auto w-fit h-fit">
                    <Spinner />
                </div>
            )}

            <div ref={endRef} />
        </div>
    );
};

const DateSeparator = ({ date }: { date: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center my-2"
        >
            <div className="px-3 py-1 bg-neutral-800/80 backdrop-blur-sm rounded-full text-xs text-neutral-400 font-medium">
                {date}
            </div>
        </motion.div>
    );
};

const Message = React.memo(({ message, index, animate }: { message: MessageProps, index: number, animate: boolean }) => {
    const { currentUser } = useUserStore();

    const isCurrentUser = message.senderId === currentUser.id;
    const messageClass = isCurrentUser ? "self-end" : "self-start";
    const messagesToAnimate = 5; // Number of messages to animate

    return (
        <motion.div
            className={`message ${messageClass}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={animate ? { duration: 0.5, type: "spring", bounce: 0.25, delay: ((index + 1) % messagesToAnimate) * 0.1 } : { duration: 0.1 }}
        >
            {!isCurrentUser && (
                <MessageAvatar message={message} />
            )}
            <MessageBody message={message} isCurrentUser={isCurrentUser} />
        </motion.div>
    );
});

const MessageAvatar = ({ message }: { message: any }) => {
    const { user, isCurrentUserBlocked, isReceiverBlocked, isGlobalChat, isGroupChat } = useChatStore();
    const isBlocked = isCurrentUserBlocked || isReceiverBlocked;

    return (
        <img
            src={(isGlobalChat || isGroupChat) ? message.senderAvatar : !isBlocked ? user.avatar : './img/avatar-placeholder.png'}
            alt="user"
            className="w-7 h-7 rounded-full object-cover"
        />
    )
}

const MessageBody = ({ message, isCurrentUser }: { message: any, isCurrentUser: boolean }) => {

    // Check if message has been read
    const isRead = message.readBy && message.readBy.length > 0;

    return (
        <div className="texts flex-1 flex flex-col gap-1">
            {/* Show sender name for group/global chats */}

            {(message.img && message.text) ? <ImgWithCaption imgSrc={message.img} text={message.text} isCurrentUser={isCurrentUser} /> :
                <>
                    {message.img && <ImgWithoutCaption imgSrc={message.img} />}
                    {message.text && <MessageParagraph text={message.text} username={!isCurrentUser && message.senderUsername} isCurrentUser={isCurrentUser} />}
                </>
            }

            {/* MESSAGE TIME AND READ RECEIPT */}
            <div className="flex items-center gap-1.5 px-1">
                <span className="text-[11px] text-neutral-400">{format(message.createdAt.toDate())}</span>

                {/* Read receipt indicators (only show for sender's messages) */}
                {isCurrentUser && (
                    <div className="flex items-center">
                        {isRead ? (
                            // Double check for read (overlapping)
                            <div className="relative flex items-center w-3.5 h-3">
                                <CheckIcon className="w-3 h-3 text-blue-400 absolute left-0" />
                                <CheckIcon className="w-3 h-3 text-blue-400 absolute left-1" />
                            </div>
                        ) : (
                            // Single check for sent
                            <CheckIcon className="w-3 h-3 text-neutral-400" />
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}


const ImgWithCaption = ({ imgSrc, text, isCurrentUser }: { imgSrc: string, text: string, isCurrentUser: boolean }) => {
    return (
        <div className={classNames(
            'rounded-2xl overflow-hidden shadow-lg',
            isCurrentUser
                ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                : 'bg-neutral-800/90 backdrop-blur-sm'
        )}>
            <ImgWithoutCaption imgSrc={imgSrc} />
            <div className="px-4 py-2.5">
                <span className="text-white text-[15px] leading-relaxed break-words">{text}</span>
            </div>
        </div>
    )
}

const ImgWithoutCaption = ({ imgSrc }: { imgSrc: string }) => {
    return (
        <img src={imgSrc} alt="user" className="w-full object-cover max-h-[400px]" />
    )
}

const MessageParagraph = ({ text, username, isCurrentUser }: { text: string, username?: string, isCurrentUser: boolean }) => {
    const { isGlobalChat, isGroupChat } = useChatStore();

    return (
        <p className={classNames(
            'text-white rounded-2xl break-all max-w-fit px-4 py-2.5 shadow-lg flex flex-col gap-1',
            isCurrentUser
                ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                : 'bg-neutral-800/90 backdrop-blur-sm'
        )}>
            {(isGlobalChat || isGroupChat) && !isCurrentUser && (
                <span className="text-xs text-blue-400 font-semibold">{username}</span>
            )}
            <span className="text-[15px] leading-relaxed">{text}</span>
        </p>
    )
}

Message.displayName = "Message";
