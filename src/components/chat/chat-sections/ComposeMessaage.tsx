import EmojiPicker from "emoji-picker-react";
import { useChatStore } from "../../../lib/chatStore";
import { useComposeMessage, OptimisticCallbacks } from "../../../hooks/chat/useComposeMessage";
import { FaceSmileIcon, PaperAirplaneIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { AutoExpandingTextarea } from "../../ui/AutoExpandingTextarea";
import { useRef, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

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

interface ComposeMessageProps {
    optimisticCallbacks?: OptimisticCallbacks;
}

export const ComposeMessage = ({ optimisticCallbacks }: ComposeMessageProps) => {
    const { isCurrentUserBlocked, isReceiverBlocked, isGlobalChat, isGroupChat, groupData } = useChatStore();
    const { handleImgSelect, img, setImg, handleEmoji, handleSendText, text, setText, openEmoji, setOpenEmoji } = useComposeMessage(optimisticCallbacks);
    const isBlocked = isCurrentUserBlocked || isReceiverBlocked;
    const [participants, setParticipants] = useState<MentionUser[]>([]);

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

    return (
        <div className="mt-auto flex justify-between items-center sm:gap-5 p-5 border-t border-neutral-800">
            <div className="icons flex gap-2 sm:gap-5">
                <FileInput handleImgSelect={handleImgSelect} isBlocked={isBlocked} />
                <EmojiPickerComponent openEmoji={openEmoji} setOpenEmoji={setOpenEmoji} handleEmoji={handleEmoji} isBlocked={isBlocked} />
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
