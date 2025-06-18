import { useChatStore } from "../../../lib/chatStore";
import { format } from "timeago.js";
import { useUserStore } from "../../../lib/userStore";
import { useUpdateMessages } from "../../../hooks/chat/useUpdateMessages";
import React from "react";
import { Spinner } from "../../ui/Spinner";
import { motion } from "framer-motion";
import { classNames } from "../../../utils/helpers";

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
}

export const Messages = () => {
    const { messages, endRef } = useUpdateMessages();
    const messagesToAnimate = 5; // Number of messages to animate

    return (
        <div className="center flex-1 p-5 overflow-scroll flex flex-col gap-5">
            {messages ? (
                <>
                    {messages.map((message: MessageProps, index: number) => (
                        <Message
                            key={message.createdAt.toDate().toISOString()}
                            message={message}
                            index={index}
                            animate={index >= messages.length - messagesToAnimate}
                        />
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
    const { user, isCurrentUserBlocked, isReceiverBlocked, isGlobalChat } = useChatStore();
    const isBlocked = isCurrentUserBlocked || isReceiverBlocked;

    return (
        <img
            src={isGlobalChat ? message.senderAvatar : !isBlocked ? user.avatar : './img/avatar-placeholder.png'}
            alt="user"
            className="w-7 h-7 rounded-full object-cover"
        />
    )
}

const MessageBody = ({ message, isCurrentUser }: { message: any, isCurrentUser: boolean }) => {
    return (
        <div className="texts flex-1 flex flex-col gap-1">
            {/* { isGlobalChat && <span className="ml-1 text-xs text-neutral-500">{message.senderUsername}</span> } */}
            {(message.img && message.text) ? <ImgWithCaption imgSrc={message.img} text={message.text} isCurrentUser={isCurrentUser} /> :
                <>
                    {message.img && <ImgWithoutCaption imgSrc={message.img} /> }
                    {message.text && <MessageParagraph text={message.text} username={!isCurrentUser && message.senderUsername} isCurrentUser={isCurrentUser} />}
                </>
            }
            {/* MESSAGE TIME */}
            <span className="text-neutral-500 text-xs">{format(message.createdAt.toDate())}</span>
        </div>
    )
}


const ImgWithCaption = ({ imgSrc, text, isCurrentUser }: { imgSrc: string, text: string, isCurrentUser: boolean }) => {
    return (
        <div className={classNames('rounded-lg border-2', isCurrentUser ? 'border-blue-900' : 'border-blue-950/30')}>
            <ImgWithoutCaption imgSrc={imgSrc} />
            <MessageParagraph text={text} isCurrentUser={isCurrentUser} />
        </div>
    )
}

const ImgWithoutCaption = ({ imgSrc }: { imgSrc: string }) => {
    return (
        <img src={imgSrc} alt="user" className="rounded-lg object-cover max-h-[400px]" />
    )
}

const MessageParagraph = ({ text, username, isCurrentUser }: { text: string, username?: string, isCurrentUser: boolean }) => {
    const { isGlobalChat } = useChatStore();

    return (
        <p className={classNames('text-white rounded-lg break-all flex flex-col gap-1', isCurrentUser ? 'bg-blue-900' : 'bg-blue-950/30', username ? 'px-4 py-3' : 'p-4')}>
            { isGlobalChat && <span className="text-xs text-neutral-500">{username}</span> }
            <span>{text}</span>
        </p>
    )
}

Message.displayName = "Message";
