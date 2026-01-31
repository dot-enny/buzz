import { useRef, useCallback, useEffect, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useChatStore } from '../../../lib/chatStore';
import { useUserStore } from '../../../lib/userStore';
import { motion, AnimatePresence } from 'framer-motion';
import { classNames } from '../../../utils/helpers';
import { CheckIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { CheckIcon as CheckIconSolid } from '@heroicons/react/24/solid';
import { groupMessagesByDate } from '../../../utils/dateHelpers';
import { Avatar } from '../../ui/Avatar';
import { ImageLightbox } from '../../ui/ImageLightbox';
import { Spinner } from '../../ui/Spinner';
import { HighlightedText } from '../../ui/HighlightedText';
import { useMessageLinkPreviews } from '../../../hooks/chat/useLinkPreview';

// Threshold for enabling virtualization
const VIRTUALIZATION_THRESHOLD = 100;

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

interface VirtualizedMessagesProps {
    messages: MessageProps[] | null;
    activeSearchResultId?: string;
    getMatchIndices?: (messageId: string) => [number, number][] | null;
    onScrollToBottom?: () => void;
}

/**
 * VirtualizedMessages - High-performance message list for chats with 1000+ messages
 * Uses TanStack Virtual for windowed rendering
 */
export const VirtualizedMessages = ({ 
    messages, 
    activeSearchResultId, 
    getMatchIndices,
    onScrollToBottom 
}: VirtualizedMessagesProps) => {
    const { isGlobalChat, isGroupChat } = useChatStore();
    const parentRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const prevMessageCount = useRef(messages?.length ?? 0);

    // Flatten grouped messages for virtualization
    const flattenedItems = messages ? flattenMessages(messages) : [];
    const shouldVirtualize = flattenedItems.length > VIRTUALIZATION_THRESHOLD;

    // Virtual list configuration
    const virtualizer = useVirtualizer({
        count: flattenedItems.length,
        getScrollElement: () => parentRef.current,
        estimateSize: (index) => {
            const item = flattenedItems[index];
            if (item.type === 'date') return 48; // Date separator height
            if (item.message?.img) return 320; // Message with image
            return 80; // Regular message
        },
        overscan: 10, // Render 10 extra items above/below viewport
        getItemKey: (index) => flattenedItems[index].key,
    });

    // Auto-scroll to bottom for new messages
    useEffect(() => {
        if (!messages) return;
        
        const currentCount = messages.length;
        const hasNewMessages = currentCount > prevMessageCount.current;
        
        if (hasNewMessages && isAtBottom) {
            virtualizer.scrollToIndex(flattenedItems.length - 1, { align: 'end' });
            onScrollToBottom?.();
        }
        
        prevMessageCount.current = currentCount;
    }, [messages?.length, isAtBottom, flattenedItems.length, virtualizer, onScrollToBottom]);

    // Scroll to active search result
    useEffect(() => {
        if (!activeSearchResultId) return;
        
        const index = flattenedItems.findIndex(
            item => item.type === 'message' && item.message?.id === activeSearchResultId
        );
        
        if (index !== -1) {
            virtualizer.scrollToIndex(index, { align: 'center', behavior: 'smooth' });
        }
    }, [activeSearchResultId, flattenedItems, virtualizer]);

    // Track if user is at bottom
    const handleScroll = useCallback(() => {
        const element = parentRef.current;
        if (!element) return;
        
        const { scrollTop, scrollHeight, clientHeight } = element;
        const threshold = 100;
        setIsAtBottom(scrollHeight - scrollTop - clientHeight < threshold);
    }, []);

    // If not enough messages, render without virtualization
    if (!shouldVirtualize) {
        return (
            <NonVirtualizedMessages 
                messages={messages}
                activeSearchResultId={activeSearchResultId}
                getMatchIndices={getMatchIndices}
                isGlobalChat={isGlobalChat}
                isGroupChat={isGroupChat}
            />
        );
    }

    return (
        <div 
            ref={parentRef}
            className="flex-1 overflow-auto p-5 pt-0"
            onScroll={handleScroll}
        >
            {messages === null ? (
                <div className="absolute inset-0 m-auto w-fit h-fit">
                    <Spinner />
                </div>
            ) : messages.length === 0 ? (
                <EmptyState isGlobalChat={isGlobalChat} isGroupChat={isGroupChat} />
            ) : (
                <div
                    style={{
                        height: `${virtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    {virtualizer.getVirtualItems().map((virtualItem) => {
                        const item = flattenedItems[virtualItem.index];
                        
                        return (
                            <div
                                key={virtualItem.key}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: `${virtualItem.size}px`,
                                    transform: `translateY(${virtualItem.start}px)`,
                                }}
                            >
                                {item.type === 'date' ? (
                                    <DateSeparator date={item.date!} />
                                ) : (
                                    <VirtualMessage 
                                        message={item.message!}
                                        matchIndices={getMatchIndices?.(item.message!.id) || null}
                                        isActiveResult={activeSearchResultId === item.message!.id}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            
            {/* Scroll to bottom button */}
            <AnimatePresence>
                {!isAtBottom && messages && messages.length > 0 && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        onClick={() => virtualizer.scrollToIndex(flattenedItems.length - 1, { align: 'end', behavior: 'smooth' })}
                        className="fixed bottom-24 right-8 p-3 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg transition-colors z-20"
                    >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper to flatten grouped messages into a single array
interface FlattenedItem {
    type: 'date' | 'message';
    key: string;
    date?: string;
    message?: MessageProps;
}

function flattenMessages(messages: MessageProps[]): FlattenedItem[] {
    const grouped = groupMessagesByDate(messages);
    const items: FlattenedItem[] = [];
    
    grouped.forEach((group: { date: string; messages: MessageProps[] }) => {
        items.push({ type: 'date', key: `date-${group.date}`, date: group.date });
        group.messages.forEach((message: MessageProps) => {
            items.push({ type: 'message', key: message.id || `msg-${Math.random()}`, message });
        });
    });
    
    return items;
}

// Date separator component
const DateSeparator = ({ date }: { date: string }) => (
    <div className="flex items-center justify-center py-3">
        <div className="px-3 py-1 bg-neutral-800/90 backdrop-blur-sm rounded-full text-xs text-neutral-400 font-medium shadow-lg">
            {date}
        </div>
    </div>
);

// Single virtualized message
const VirtualMessage = ({ 
    message, 
    matchIndices,
    isActiveResult 
}: { 
    message: MessageProps;
    matchIndices: [number, number][] | null;
    isActiveResult: boolean;
}) => {
    const { currentUser } = useUserStore();
    const isCurrentUser = message.senderId === currentUser.id;
    const messageClass = isCurrentUser ? 'self-end' : 'self-start';

    return (
        <div 
            className={classNames(
                `message ${messageClass} flex gap-5 w-full`,
                isActiveResult ? 'ring-2 ring-yellow-500/50 rounded-2xl bg-yellow-500/10' : ''
            )}
            style={{ justifyContent: isCurrentUser ? 'flex-end' : 'flex-start' }}
        >
            {!isCurrentUser && <MessageAvatar message={message} />}
            <MessageBody message={message} isCurrentUser={isCurrentUser} matchIndices={matchIndices} />
        </div>
    );
};

// Message avatar (reused from original)
const MessageAvatar = ({ message }: { message: MessageProps }) => {
    const { user, isCurrentUserBlocked, isReceiverBlocked, isGlobalChat, isGroupChat } = useChatStore();
    const isBlocked = isCurrentUserBlocked || isReceiverBlocked;

    if (isGlobalChat || isGroupChat) {
        return (
            <Avatar 
                src={message.senderAvatar} 
                name={message.senderUsername || 'User'} 
                size="sm" 
                className="shrink-0"
            />
        );
    }

    return (
        <Avatar 
            src={isBlocked ? null : user.avatar} 
            name={user.username} 
            size="sm" 
            className="shrink-0"
        />
    );
};

// Message body with text/image
const MessageBody = ({ 
    message, 
    isCurrentUser,
    matchIndices 
}: { 
    message: MessageProps;
    isCurrentUser: boolean;
    matchIndices: [number, number][] | null;
}) => {
    const { isGlobalChat, isGroupChat } = useChatStore();
    const showSenderName = !isCurrentUser && (isGlobalChat || isGroupChat);
    const previews = useMessageLinkPreviews(message.text);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    return (
        <div className={`texts flex-1 flex flex-col gap-1 max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
            {showSenderName && message.senderUsername && (
                <span className="text-xs text-blue-400 font-medium mb-0.5 truncate max-w-full">
                    {message.senderUsername}
                </span>
            )}
            
            {message.img && (
                <>
                    <img 
                        src={message.img} 
                        alt="message" 
                        className="rounded-lg max-h-80 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setLightboxOpen(true)}
                        loading="lazy"
                        decoding="async"
                    />
                    <ImageLightbox 
                        src={message.img} 
                        isOpen={lightboxOpen} 
                        onClose={() => setLightboxOpen(false)} 
                    />
                </>
            )}
            
            {message.text && (
                <p className={classNames(
                    'p-3 rounded-2xl break-words',
                    isCurrentUser 
                        ? 'bg-blue-600 text-white rounded-br-sm' 
                        : 'bg-neutral-800/90 text-white rounded-bl-sm'
                )}>
                    {matchIndices ? (
                        <HighlightedText text={message.text} matchIndices={matchIndices} />
                    ) : (
                        message.text
                    )}
                </p>
            )}

            {/* Link previews */}
            {previews.length > 0 && (
                <div className="w-full max-w-sm">
                    {/* Render link previews here */}
                </div>
            )}

            {/* Timestamp and status */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <span>{formatTime(message.createdAt.toDate())}</span>
                {isCurrentUser && <MessageStatus message={message} />}
            </div>
        </div>
    );
};

// Message status indicator
const MessageStatus = ({ message }: { message: MessageProps }) => {
    const { currentUser } = useUserStore();
    const status = message.status || 'sent';
    const isRead = message.readBy?.some(id => id !== currentUser.id);

    if (status === 'sending') {
        return <ClockIcon className="w-3.5 h-3.5 text-neutral-500" />;
    }
    if (status === 'failed') {
        return <ExclamationCircleIcon className="w-3.5 h-3.5 text-red-500" />;
    }
    if (isRead) {
        return <CheckIconSolid className="w-3.5 h-3.5 text-blue-400" />;
    }
    return <CheckIcon className="w-3.5 h-3.5 text-neutral-400" />;
};

// Empty state
const EmptyState = ({ isGlobalChat, isGroupChat }: { isGlobalChat: boolean; isGroupChat: boolean }) => (
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

// Non-virtualized fallback for smaller lists
const NonVirtualizedMessages = ({ 
    messages,
    activeSearchResultId,
    getMatchIndices,
    isGlobalChat,
    isGroupChat
}: {
    messages: MessageProps[] | null;
    activeSearchResultId?: string;
    getMatchIndices?: (messageId: string) => [number, number][] | null;
    isGlobalChat: boolean;
    isGroupChat: boolean;
}) => {
    const endRef = useRef<HTMLDivElement>(null);
    const groupedMessages = messages ? groupMessagesByDate(messages) : [];

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages?.length]);

    return (
        <div className="flex-1 p-5 pt-0 overflow-auto flex flex-col gap-5 relative">
            {messages === null ? (
                <div className="absolute inset-0 m-auto w-fit h-fit">
                    <Spinner />
                </div>
            ) : messages.length === 0 ? (
                <EmptyState isGlobalChat={isGlobalChat} isGroupChat={isGroupChat} />
            ) : (
                groupedMessages.map((group: { date: string; messages: MessageProps[] }) => (
                    <div key={group.date} className="flex flex-col gap-5">
                        <DateSeparator date={group.date} />
                        {group.messages.map((message: MessageProps) => (
                            <VirtualMessage 
                                key={message.id}
                                message={message}
                                matchIndices={getMatchIndices?.(message.id) || null}
                                isActiveResult={activeSearchResultId === message.id}
                            />
                        ))}
                    </div>
                ))
            )}
            <div ref={endRef} />
        </div>
    );
};

export default VirtualizedMessages;
