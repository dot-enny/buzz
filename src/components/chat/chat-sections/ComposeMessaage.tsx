import EmojiPicker from "emoji-picker-react";
import { useChatStore } from "../../../lib/chatStore";
import { useComposeMessage, OptimisticCallbacks } from "../../../hooks/chat/useComposeMessage";
import { FaceSmileIcon, PaperAirplaneIcon, PhotoIcon, GifIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { AutoExpandingTextarea } from "../../ui/AutoExpandingTextarea";
import { useRef, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { GiphyPicker } from "./GiphyPicker";
import { GiphyGif } from "../../../hooks/chat/useGiphy";
import { useMessageLinkPreviews, LinkPreviewData } from "../../../hooks/chat/useLinkPreview";

interface MentionUser {
    id: string;
    username: string;
    avatar?: string;
}

interface FileInputProps {
    handleImgSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isBlocked: boolean;
}

interface EmojiPickerComponentProps {
    openEmoji: boolean;
    setOpenEmoji: React.Dispatch<React.SetStateAction<boolean>>;
    handleEmoji: (emoji: any) => void;
    isBlocked: boolean;
}

interface SendButtonProps {
    handleSendText: () => void;
    isBlocked: boolean;
}

interface GifButtonProps {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onSelect: (gif: GiphyGif) => void;
    isBlocked: boolean;
}

interface ComposeMessageProps {
    optimisticCallbacks?: OptimisticCallbacks;
}

export const ComposeMessage = ({ optimisticCallbacks }: ComposeMessageProps) => {
    const { isCurrentUserBlocked, isReceiverBlocked, isGlobalChat, isGroupChat, groupData } = useChatStore();
    const { handleImgSelect, img, setImg, handleEmoji, handleSendText, text, setText, openEmoji, setOpenEmoji, handleGifSelect } = useComposeMessage(optimisticCallbacks);
    const isBlocked = isCurrentUserBlocked || isReceiverBlocked;
    const [participants, setParticipants] = useState<MentionUser[]>([]);
    const [isGiphyOpen, setIsGiphyOpen] = useState(false);

    // Fetch participant details for mentions (only for group/global chats)
    useEffect(() => {
        const fetchParticipants = async () => {
            if (!isGlobalChat && !isGroupChat) {
                setParticipants([]);
                return;
            }

            if (isGroupChat && groupData?.participants) {
                try {
                    const userPromises = groupData.participants.map(async (userId: string) => {
                        const userDoc = await getDoc(doc(db, "users", userId));
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            return {
                                id: userId,
                                username: userData.username,
                                avatar: userData.avatar
                            };
                        }
                        return null;
                    });
                    const users = (await Promise.all(userPromises)).filter(Boolean) as MentionUser[];
                    setParticipants(users);
                } catch (err) {
                    console.error("Error fetching participants:", err);
                }
            }
            // For global chat, we could fetch recent message senders, but for now just empty
        };

        fetchParticipants();
    }, [isGlobalChat, isGroupChat, groupData?.participants]);

    // Only enable mentions for group/global chats
    const mentionParticipants = (isGlobalChat || isGroupChat) ? participants : undefined;

    // Handle GIF selection
    const onGifSelect = (gif: GiphyGif) => {
        handleGifSelect(gif.url);
        setIsGiphyOpen(false);
    };

    // Link preview for compose area
    const linkPreviews = useMessageLinkPreviews(text);
    const firstPreview = linkPreviews[0];
    const [dismissedPreview, setDismissedPreview] = useState<string | null>(null);
    
    // Reset dismissed preview when text changes and URL changes
    useEffect(() => {
        if (firstPreview?.url !== dismissedPreview) {
            setDismissedPreview(null);
        }
    }, [firstPreview?.url]);

    const showPreview = firstPreview && !firstPreview.error && firstPreview.url !== dismissedPreview;

    return (
        <div className="mt-auto border-t border-neutral-800 relative">
            {/* Link Preview (above compose bar) */}
            {showPreview && (
                <ComposeLinkPreview 
                    preview={firstPreview} 
                    onDismiss={() => setDismissedPreview(firstPreview.url)} 
                />
            )}
            
            {/* Compose Bar */}
            <div className="flex justify-between items-center sm:gap-5 p-5">
                <div className="icons flex gap-2 sm:gap-5">
                    <FileInput handleImgSelect={handleImgSelect} isBlocked={isBlocked} />
                    <EmojiPickerComponent openEmoji={openEmoji} setOpenEmoji={setOpenEmoji} handleEmoji={handleEmoji} isBlocked={isBlocked} />
                    <GifButton isOpen={isGiphyOpen} setIsOpen={setIsGiphyOpen} onSelect={onGifSelect} isBlocked={isBlocked} />
                </div>
                <AutoExpandingTextarea 
                    text={text} 
                    setText={setText} 
                    handleSendText={handleSendText} 
                    isBlocked={isBlocked} 
                    img={img.url} 
                    removeImg={setImg}
                    participants={mentionParticipants}
                />
                <SendButton handleSendText={handleSendText} isBlocked={isBlocked} />
            </div>
        </div>
    );
};

const FileInput = ({ handleImgSelect, isBlocked }: FileInputProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleImgSelect(e);
        // Reset input value so selecting the same file again triggers onChange
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <button onClick={() => inputRef.current?.click()} disabled={isBlocked} className="disabled:cursor-not-allowed">
            <PhotoIcon className="text-white size-5" />
            <input type="file" id="file" className="hidden" onChange={onChange} ref={inputRef} />
        </button>
    );
};

const EmojiPickerComponent = ({ openEmoji, setOpenEmoji, handleEmoji, isBlocked }: EmojiPickerComponentProps) => (
    <div className="relative flex items-center">
        <button onClick={() => setOpenEmoji(prev => !prev)} disabled={isBlocked} className="disabled:cursor-not-allowed">
            <FaceSmileIcon className="text-white size-5" />
        </button>
        {openEmoji && (
            <div className="absolute bottom-12 left-0">
                <EmojiPicker onEmojiClick={handleEmoji} />
            </div>
        )}
    </div>
);

const SendButton = ({ handleSendText, isBlocked }: SendButtonProps) => (
    <button
        onClick={handleSendText}
        disabled={isBlocked}
        className="text-white sm:p-2 border-none rounded disabled:opacity-50 disabled:cursor-not-allowed"
    >
        <PaperAirplaneIcon className="text-white size-5" />
    </button>
);

const GifButton = ({ isOpen, setIsOpen, onSelect, isBlocked }: GifButtonProps) => (
    <div className="relative flex items-center">
        <button 
            onClick={() => setIsOpen(prev => !prev)} 
            disabled={isBlocked} 
            className="disabled:cursor-not-allowed"
        >
            <GifIcon className="text-white size-5" />
        </button>
        <GiphyPicker 
            isOpen={isOpen} 
            onClose={() => setIsOpen(false)} 
            onSelect={onSelect} 
        />
    </div>
);

// Link preview component for compose area
interface ComposeLinkPreviewProps {
    preview: LinkPreviewData;
    onDismiss: () => void;
}

const ComposeLinkPreview = ({ preview, onDismiss }: ComposeLinkPreviewProps) => {
    if (preview.isLoading) {
        return (
            <div className="px-5 py-3 border-b border-neutral-800">
                <div className="flex items-center gap-3 animate-pulse">
                    <div className="w-12 h-12 bg-neutral-700 rounded" />
                    <div className="flex-1 min-w-0">
                        <div className="h-4 w-32 bg-neutral-700 rounded mb-2" />
                        <div className="h-3 w-48 bg-neutral-700 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    const hostname = new URL(preview.url).hostname.replace('www.', '');

    return (
        <div className="px-5 py-3 border-b border-neutral-800 bg-neutral-900/50">
            <div className="flex items-start gap-3">
                {/* Thumbnail */}
                {preview.image && (
                    <img 
                        src={preview.image} 
                        alt="" 
                        className="w-12 h-12 object-cover rounded shrink-0"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                )}
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                        {preview.title || hostname}
                    </p>
                    {preview.description && (
                        <p className="text-xs text-neutral-400 truncate">
                            {preview.description}
                        </p>
                    )}
                    <p className="text-xs text-neutral-500 truncate">{hostname}</p>
                </div>
                
                {/* Dismiss button */}
                <button 
                    onClick={onDismiss}
                    className="shrink-0 p-1 hover:bg-neutral-700 rounded transition-colors"
                >
                    <XMarkIcon className="w-4 h-4 text-neutral-400" />
                </button>
            </div>
        </div>
    );
};
