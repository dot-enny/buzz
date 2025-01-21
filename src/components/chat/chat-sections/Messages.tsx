import { useChatStore } from "../../../lib/chatStore";
import { format } from "timeago.js";
import { useUserStore } from "../../../lib/userStore";
import { useUpdateMessages } from "../../../hooks/chat/useUpdateMessages";
import React from "react";

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

    return (
        <div className="center flex-1 p-5 overflow-scroll flex flex-col gap-5">
            {messages &&
                messages.map((message: MessageProps) => (
                    <Message key={message.createdAt.toDate().toISOString()} message={message} />
                ))
            }
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

const Message = React.memo(({ message }: { message: MessageProps }) => {
    const { currentUser } = useUserStore();
    const { user } = useChatStore();

    const isCurrentUser = message.senderId === currentUser.id;
    const messageClass = isCurrentUser ? "self-end" : "self-start";
    const textClass = isCurrentUser ? "bg-blue-900" : "bg-blue-950/30";

    return (
        <div className={`message ${messageClass}`}>
            {!isCurrentUser && (
                <img
                    src={user.avatar}
                    alt="user"
                    className="w-7 h-7 rounded-full object-cover"
                />
            )}
            <div className="texts flex-1 flex flex-col gap-1">
                {message.img && (
                    <img src={message.img} alt="user" className="rounded-lg object-cover h-[400px]" />
                )}
                <p className={`text-white ${textClass} p-5 rounded-lg break-all`}>{message.text}</p>
                <span className="text-neutral-500 text-xs">{format(message.createdAt.toDate())}</span>
            </div>
        </div>
    );
});

Message.displayName = "Message";
