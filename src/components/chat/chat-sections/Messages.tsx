import { useChatStore } from "../../../lib/chatStore";
import { format } from "timeago.js";
import { useUserStore } from "../../../lib/userStore";
import { useUpdateMessages } from "../../../hooks/chat/useUpdateMessages";
import React from "react";
import { Spinner } from "../../ui/Spinner";
import { motion } from "framer-motion";

interface MessageProps {
    id: string;
    senderId: string;
    text: string;
    img?: string;
    createdAt: {
        toDate: () => Date;
    };
}

export const Messages = ({ img }: { img: string }) => {
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
            {img && (
                <div className="message max-w-[70%] gap-5 self-end">
                    <div className="texts flex-1 flex flex-col gap-1">
                        <img src={img} alt="user" className="rounded-lg object-cover" />
                    </div>
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
    const textClass = isCurrentUser ? "bg-blue-900" : "bg-blue-950/30";
    const messagesToAnimate = 5; // Number of messages to animate

    return (
        <motion.div
            className={`message ${messageClass}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={animate ? { duration: 0.5, type: "spring", bounce: 0.25, delay: ((index+1) % messagesToAnimate) * 0.1 } : { duration: 0.1 }}
        >
            {!isCurrentUser && (
                <img
                    src={!isBlocked ? user.avatar : './img/avatar-placeholder.png'} 
                    alt="user"
                    className="w-7 h-7 rounded-full object-cover"
                />
            )}
            <div className="texts flex-1 flex flex-col gap-1">
                {message.img && (
                    <img src={message.img} alt="user" className="rounded-lg object-cover h-[400px]" />
                )}
                <p className={`text-white ${textClass} p-4 rounded-lg break-all`}>{message.text}</p>
                <span className="text-neutral-500 text-xs">{format(message.createdAt.toDate())}</span>
            </div>
        </motion.div>
    );
});

Message.displayName = "Message";
