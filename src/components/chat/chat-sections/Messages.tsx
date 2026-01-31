import { useChatStore } from "../../../lib/chatStore";
import { useUserStore } from "../../../lib/userStore";
import React, { useState, RefObject, useEffect, useRef } from "react";
import { Spinner } from "../../ui/Spinner";
import { motion, AnimatePresence } from "framer-motion";
import { classNames } from "../../../utils/helpers";
import { CheckIcon, ClockIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { CheckIcon as CheckIconSolid } from "@heroicons/react/24/solid";
import { groupMessagesByDate } from "../../../utils/dateHelpers";
import { Avatar } from "../../ui/Avatar";
import { ImageLightbox } from "../../ui/ImageLightbox";
import { bubblySpring } from "../../ui/ConnectionStatus";
import { useMessageLinkPreviews } from "../../../hooks/chat/useLinkPreview";
import { HighlightedText } from "../../ui/HighlightedText";

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
    activeSearchResultId?: string;
    getMatchIndices?: (messageId: string) => [number, number][] | null;
}

export const Messages = ({ messages, endRef, activeSearchResultId, getMatchIndices }: MessagesComponentProps) => {
    const { isGlobalChat, isGroupChat } = useChatStore();
    const messagesToAnimate = 5; // Number of messages to animate
    const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    // Group messages by date
    const groupedMessages = messages ? groupMessagesByDate(messages) : [];

    // Scroll to active search result
    useEffect(() => {
        if (activeSearchResultId && messageRefs.current.has(activeSearchResultId)) {
            const element = messageRefs.current.get(activeSearchResultId);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [activeSearchResultId]);

    // Store ref for a message
    const setMessageRef = (id: string, element: HTMLDivElement | null) => {
        if (element) {
            messageRefs.current.set(id, element);
        } else {
            messageRefs.current.delete(id);
        }
    };

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
                                    const matchIndices = getMatchIndices?.(message.id) || null;
                                    const isActiveResult = activeSearchResultId === message.id;
                                    
                                    return (
                                        <Message
                                            key={message.id || message.createdAt.toDate().toISOString()}
                                            message={message}
                                            index={globalIndex}
                                            animate={globalIndex >= messages.length - messagesToAnimate}
                                            matchIndices={matchIndices}
                                            isActiveResult={isActiveResult}
                                            setRef={(el) => setMessageRef(message.id, el)}
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

const Message = React.memo(({ message, index, animate, matchIndices, isActiveResult, setRef }: { 
    message: MessageProps, 
    index: number, 
    animate: boolean,
    matchIndices?: [number, number][] | null,
    isActiveResult?: boolean,
    setRef?: (el: HTMLDivElement | null) => void
}) => {
    const { currentUser } = useUserStore();

    const isCurrentUser = message.senderId === currentUser.id;
    const messageClass = isCurrentUser ? "self-end" : "self-start";
    const messagesToAnimate = 5; // Number of messages to animate

    return (
        <motion.div
            ref={setRef}
            className={classNames(
                `message ${messageClass}`,
                isActiveResult ? 'ring-2 ring-yellow-500/50 rounded-2xl bg-yellow-500/10' : ''
            )}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
                opacity: 1, 
                scale: 1
            }}
            transition={animate ? { duration: 0.5, type: "spring", bounce: 0.25, delay: ((index + 1) % messagesToAnimate) * 0.1 } : { duration: 0.1 }}
        >
            {!isCurrentUser && (
                <MessageAvatar message={message} />
            )}
            <MessageBody message={message} isCurrentUser={isCurrentUser} matchIndices={matchIndices} />
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

const MessageBody = ({ message, isCurrentUser, matchIndices }: { 
    message: MessageProps, 
    isCurrentUser: boolean,
    matchIndices?: [number, number][] | null 
}) => {

    // Check if message has been read
    const isRead = message.readBy && message.readBy.length > 0;
    const isSending = message.status === 'sending';
    const isFailed = message.status === 'failed';
    const isDelivered = message.status === 'delivered';

    return (
        <div className={classNames("texts flex-1 flex flex-col gap-1", isSending ? "opacity-70" : "")}>
            {/* Show sender name for group/global chats */}

            {(message.img && message.text) ? (
                <ImgWithCaption 
                    imgSrc={message.img} 
                    text={message.text} 
                    isCurrentUser={isCurrentUser} 
                    matchIndices={matchIndices}
                />
            ) : (
                <>
                    {message.img && <ImgWithoutCaption imgSrc={message.img} />}
                    {message.text && (
                        <MessageParagraph 
                            text={message.text} 
                            username={!isCurrentUser ? message.senderUsername : undefined} 
                            isCurrentUser={isCurrentUser}
                            matchIndices={matchIndices}
                        />
                    )}
                </>
            )}

            {/* MESSAGE TIME AND STATUS */}
            <div className="flex items-center gap-1.5 px-1">
                {/* Time or status text */}
                <span className="text-[11px] text-neutral-400">
                    {isFailed ? 'Failed' : formatTime(message.createdAt.toDate())}
                </span>

                {/* Status indicators (only for sender's messages) */}
                {isCurrentUser && (
                    <AnimatePresence mode="wait">
                        {isSending ? (
                            // Pending: Clock icon
                            <motion.div
                                key="pending"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={bubblySpring}
                            >
                                <ClockIcon className="w-3.5 h-3.5 text-neutral-500" />
                            </motion.div>
                        ) : isFailed ? (
                            // Failed: Red exclamation
                            <motion.div
                                key="failed"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={bubblySpring}
                                className="flex items-center gap-1"
                            >
                                <ExclamationCircleIcon className="w-3.5 h-3.5 text-red-400" />
                                <span className="text-[10px] text-red-400">Tap to retry</span>
                            </motion.div>
                        ) : isRead ? (
                            // Read: Double check FILLED (blue)
                            <motion.div
                                key="read"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={bubblySpring}
                                className="relative flex items-center w-4 h-3"
                            >
                                <CheckIconSolid className="w-3.5 h-3.5 text-blue-400 absolute left-0" />
                                <CheckIconSolid className="w-3.5 h-3.5 text-blue-400 absolute left-1" />
                            </motion.div>
                        ) : isDelivered ? (
                            // Delivered: Double check outline (gray)
                            <motion.div
                                key="delivered"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={bubblySpring}
                                className="relative flex items-center w-4 h-3"
                            >
                                <CheckIcon className="w-3.5 h-3.5 text-neutral-400 absolute left-0" />
                                <CheckIcon className="w-3.5 h-3.5 text-neutral-400 absolute left-1" />
                            </motion.div>
                        ) : (
                            // Sent: Single check (gray)
                            <motion.div
                                key="sent"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={bubblySpring}
                            >
                                <CheckIcon className="w-3.5 h-3.5 text-neutral-400" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    )
}


const ImgWithCaption = ({ imgSrc, text, isCurrentUser, matchIndices }: { 
    imgSrc: string, 
    text: string, 
    isCurrentUser: boolean,
    matchIndices?: [number, number][] | null
}) => {
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
                    <span className="text-white text-[15px] leading-relaxed break-words">
                        <HighlightedText text={text} matchIndices={matchIndices} />
                    </span>
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

const MessageParagraph = ({ text, username, isCurrentUser, matchIndices }: { 
    text: string, 
    username?: string, 
    isCurrentUser: boolean,
    matchIndices?: [number, number][] | null
}) => {
    const { isGlobalChat, isGroupChat } = useChatStore();
    const linkPreviews = useMessageLinkPreviews(text);
    
    // Check if we have successful previews (not loading, not error)
    const hasSuccessfulPreviews = linkPreviews.some(p => !p.isLoading && !p.error && p.title);
    
    // Check if the text is ONLY a URL (no other content)
    const trimmedText = text.trim();
    const urlOnlyRegex = /^https?:\/\/[^\s<>"{}|\\^`[\]]+$/;
    const isUrlOnly = urlOnlyRegex.test(trimmedText);

    return (
        <div className={classNames(
            'rounded-2xl overflow-hidden shadow-lg max-w-[320px]',
            isCurrentUser
                ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                : 'bg-neutral-800/90 backdrop-blur-sm'
        )}>
            {/* Text content - hide URL if it's the only content and preview exists */}
            {(!isUrlOnly || !hasSuccessfulPreviews) && (
                <div className="px-4 py-2.5 flex flex-col gap-1">
                    {(isGlobalChat || isGroupChat) && !isCurrentUser && (
                        <span className="text-xs text-blue-400 font-semibold">{username}</span>
                    )}
                    <span className="text-white text-[15px] leading-relaxed break-words">
                        <HighlightedText 
                            text={text} 
                            matchIndices={matchIndices} 
                            hideUrls={hasSuccessfulPreviews && !isUrlOnly}
                        />
                    </span>
                </div>
            )}
            
            {/* Show username for URL-only messages with previews */}
            {isUrlOnly && hasSuccessfulPreviews && (isGlobalChat || isGroupChat) && !isCurrentUser && (
                <div className="px-4 pt-2.5">
                    <span className="text-xs text-blue-400 font-semibold">{username}</span>
                </div>
            )}
            
            {/* Integrated Link Previews */}
            {linkPreviews.length > 0 && (
                <div className="border-t border-white/10">
                    {linkPreviews.map((preview, i) => (
                        <IntegratedLinkPreview 
                            key={preview.url + i} 
                            preview={preview}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// Integrated preview that fits inside the message bubble
const IntegratedLinkPreview = ({ preview }: { 
    preview: any; 
}) => {
    if (preview.isLoading) {
        return (
            <div className="p-3 animate-pulse">
                <div className="flex gap-3">
                    <div className="w-12 h-12 rounded bg-white/10" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 bg-white/10 rounded w-3/4" />
                        <div className="h-2 bg-white/10 rounded w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (preview.error || !preview.title) {
        // Show URL as clickable link if preview failed
        return (
            <a 
                href={preview.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 text-blue-300 hover:underline text-sm truncate"
            >
                {preview.url}
            </a>
        );
    }

    return (
        <a
            href={preview.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:bg-white/5 transition-colors"
        >
            {/* Image if available */}
            {preview.image && (
                <div className="aspect-video bg-black/20">
                    <img 
                        src={preview.image} 
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                </div>
            )}
            
            <div className="p-3">
                {/* Title */}
                <h4 className="font-medium text-white text-sm line-clamp-2">
                    {preview.title}
                </h4>
                
                {/* Description */}
                {preview.description && (
                    <p className="text-xs text-white/60 mt-1 line-clamp-2">
                        {preview.description}
                    </p>
                )}
                
                {/* Site info */}
                <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
                    {preview.favicon && (
                        <img 
                            src={preview.favicon} 
                            alt=""
                            className="w-3 h-3 rounded"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    )}
                    <span className="truncate">{preview.siteName}</span>
                </div>
            </div>
        </a>
    );
}

Message.displayName = "Message";
