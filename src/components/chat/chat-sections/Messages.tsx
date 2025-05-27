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
    const { user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
    const isBlocked = isCurrentUserBlocked || isReceiverBlocked;

    const isCurrentUser = message.senderId === currentUser.id;
    const messageClass = isCurrentUser ? "self-end" : "self-start";
    const textClass = isCurrentUser ? "blue-900" : "blue-950/30";
    const messagesToAnimate = 5; // Number of messages to animate

    return (
        <motion.div
            className={`message ${messageClass}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={animate ? { duration: 0.5, type: "spring", bounce: 0.25, delay: ((index + 1) % messagesToAnimate) * 0.1 } : { duration: 0.1 }}
        >
            {!isCurrentUser && (
                <img
                    src={!isBlocked ? user.avatar : './img/avatar-placeholder.png'}
                    alt="user"
                    className="w-7 h-7 rounded-full object-cover"
                />
            )}
            <div className="texts flex-1 flex flex-col gap-1">
                {(message.img && message.text) 
                    ? 
                    <ImgWithCaption img={message.img} text={message.text} isCurrentUser={isCurrentUser} /> 
                    :
                    <>
                        {message.img && (
                            <img src={message.img} alt="user" className="rounded-lg object-cover max-h-[400px]" />
                        )}
                        {message.text && <p className={classNames('text-white p-4 rounded-lg break-all', isCurrentUser ? 'bg-blue-900' : 'bg-blue-950/30')}>{message.text}</p>}
                    </>
                }
                <span className="text-neutral-500 text-xs">{format(message.createdAt.toDate())}</span>
            </div>
        </motion.div>
    );
});


const ImgWithCaption = ({ img, text, isCurrentUser }: { img: string, text: string, isCurrentUser: boolean }) => {
    return (
        <div className={classNames('rounded-lg border-2', isCurrentUser ? 'border-blue-900' : 'border-blue-950/30')}>
            <img src={img} alt="user" className="rounded-lg object-cover max-h-[400px]" />
            <p className={classNames('text-white p-4 rounded-b break-all', isCurrentUser ? 'bg-blue-900' : 'bg-blue-950/30')}>{text}</p>
        </div>
    )
}

Message.displayName = "Message";
