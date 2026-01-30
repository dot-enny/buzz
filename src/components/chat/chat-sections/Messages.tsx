import { useChatStore } from "../../../lib/chatStore";
import { useUserStore } from "../../../lib/userStore";
import React, { useState, RefObject } from "react";
import { Spinner } from "../../ui/Spinner";
import { motion } from "framer-motion";
import { classNames } from "../../../utils/helpers";
import { CheckIcon } from "@heroicons/react/24/outline";
import { groupMessagesByDate } from "../../../utils/dateHelpers";
import { Avatar } from "../../ui/Avatar";
import { ImageLightbox } from "../../ui/ImageLightbox";

// Format time as "2:34 PM"
const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
};

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
    status?: 'sending' | 'sent' | 'failed' | 'delivered';
}

interface MessagesComponentProps {
    messages: MessageProps[] | null;
    endRef: RefObject<HTMLDivElement>;
}

export const Messages = ({ messages, endRef }: MessagesComponentProps) => {
    const { isGlobalChat, isGroupChat } = useChatStore();
    const messagesToAnimate = 5; // Number of messages to animate

    // Group messages by date
    const groupedMessages = messages ? groupMessagesByDate(messages) : [];

    return (
        <div className="center flex-1 p-5 pt-0 overflow-scroll flex flex-col gap-5 relative">
            {messages ? (
                <>
                    {messages.length === 0 ? (
                        <EmptyState isGlobalChat={isGlobalChat} isGroupChat={isGroupChat} />
                    ) : (
                        groupedMessages.map((group: { date: string; messages: any[] }) => (
                            <div key={group.date} className="flex flex-col gap-5">
                                {/* Sticky Date Separator */}
                                <StickyDateSeparator date={group.date} />

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
                        ))
                    )}
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

const EmptyState = ({ isGlobalChat, isGroupChat }: { isGlobalChat: boolean; isGroupChat: boolean }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 m-auto w-fit h-fit flex flex-col items-center gap-4 px-6 text-center"
        >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </div>
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-white">
                    {isGlobalChat ? 'Start the Conversation' : isGroupChat ? 'No Messages Yet' : 'Say Hello!'}
                </h3>
                <p className="text-sm text-neutral-400 max-w-xs">
                    {isGlobalChat 
                        ? 'Be the first to send a message in the global chat' 
                        : isGroupChat 
                        ? 'Start chatting with your group members'
                        : 'Send a message to start the conversation'}
                </p>
            </div>
        </motion.div>
    );
};

const StickyDateSeparator = ({ date }: { date: string }) => {
    return (
        <div className="sticky top-0 z-10 flex items-center justify-center py-3 -mx-5 bg-gradient-to-b from-neutral-950 via-neutral-950/95 to-transparent">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="px-3 py-1 bg-neutral-800/90 backdrop-blur-sm rounded-full text-xs text-neutral-400 font-medium shadow-lg"
            >
                {date}
            </motion.div>
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
    const { user, isCurrentUserBlocked, isReceiverBlocked, isGlobalChat, isGroupChat } = useChatStore();
    const isBlocked = isCurrentUserBlocked || isReceiverBlocked;

    // For group/global chats, use sender's avatar and username
    if (isGlobalChat || isGroupChat) {
        return (
            <Avatar 
                src={message.senderAvatar} 
                name={message.senderUsername || 'Unknown'} 
                size="xs"
            />
        );
    }

    // For 1-on-1 chats, use the other user's avatar
    return (
        <Avatar 
            src={isBlocked ? null : user.avatar} 
            name={user.username} 
            size="xs"
        />
    );
}

const MessageBody = ({ message, isCurrentUser }: { message: MessageProps, isCurrentUser: boolean }) => {

    // Check if message has been read
    const isRead = message.readBy && message.readBy.length > 0;
    const isSending = message.status === 'sending';
    const isFailed = message.status === 'failed';

    return (
        <div className={classNames("texts flex-1 flex flex-col gap-1", isSending ? "opacity-70" : "")}>
            {/* Show sender name for group/global chats */}

            {(message.img && message.text) ? <ImgWithCaption imgSrc={message.img} text={message.text} isCurrentUser={isCurrentUser} /> :
                <>
                    {message.img && <ImgWithoutCaption imgSrc={message.img} />}
                    {message.text && <MessageParagraph text={message.text} username={!isCurrentUser ? message.senderUsername : undefined} isCurrentUser={isCurrentUser} />}
                </>
            }

            {/* MESSAGE TIME AND READ RECEIPT */}
            <div className="flex items-center gap-1.5 px-1">
                <span className="text-[11px] text-neutral-400">
                    {isSending ? 'Sending...' : isFailed ? 'Failed to send' : formatTime(message.createdAt.toDate())}
                </span>

                {/* 
                    Read receipt indicators (only show for sender's messages)
                    Standard: ✓ (gray) = Sent, ✓✓ (gray) = Delivered, ✓✓ (blue filled) = Read
                    Note: "Delivered" would require FCM/push notification tracking, 
                    so for now we show: Sent -> Read
                */}
                {isCurrentUser && !isSending && !isFailed && (
                    <div className="flex items-center">
                        {isRead ? (
                            // Double check FILLED for read (blue)
                            <div className="relative flex items-center w-4 h-3">
                                <svg className="w-3.5 h-3.5 text-blue-400 absolute left-0" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                                </svg>
                                <svg className="w-3.5 h-3.5 text-blue-400 absolute left-1.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                                </svg>
                            </div>
                        ) : (
                            // Single check (gray stroke) for sent
                            <CheckIcon className="w-3.5 h-3.5 text-neutral-400" />
                        )}
                    </div>
                )}
                
                {/* Failed indicator */}
                {isFailed && (
                    <span className="text-[11px] text-red-400">• Tap to retry</span>
                )}
            </div>
        </div>
    )
}


const ImgWithCaption = ({ imgSrc, text, isCurrentUser }: { imgSrc: string, text: string, isCurrentUser: boolean }) => {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    
    return (
        <>
            <div className={classNames(
                'rounded-2xl overflow-hidden shadow-lg',
                isCurrentUser
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                    : 'bg-neutral-800/90 backdrop-blur-sm'
            )}>
                <ClickableImage imgSrc={imgSrc} onClick={() => setIsLightboxOpen(true)} />
                <div className="px-4 py-2.5">
                    <span className="text-white text-[15px] leading-relaxed break-words">{text}</span>
                </div>
            </div>
            <ImageLightbox 
                isOpen={isLightboxOpen} 
                onClose={() => setIsLightboxOpen(false)} 
                src={imgSrc} 
            />
        </>
    )
}

const ImgWithoutCaption = ({ imgSrc }: { imgSrc: string }) => {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    
    return (
        <>
            <ClickableImage imgSrc={imgSrc} onClick={() => setIsLightboxOpen(true)} rounded />
            <ImageLightbox 
                isOpen={isLightboxOpen} 
                onClose={() => setIsLightboxOpen(false)} 
                src={imgSrc} 
            />
        </>
    )
}

const ClickableImage = ({ imgSrc, onClick, rounded = false }: { imgSrc: string, onClick: () => void, rounded?: boolean }) => {
    return (
        <img 
            src={imgSrc} 
            alt="shared image" 
            className={classNames(
                "w-full object-cover max-h-[400px] cursor-pointer hover:opacity-90 transition-opacity",
                rounded ? "rounded-2xl" : ""
            )}
            onClick={onClick}
        />
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
