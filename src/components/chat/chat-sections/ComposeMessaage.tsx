import EmojiPicker from "emoji-picker-react";
import { useChatStore } from "../../../lib/chatStore";
import { Img } from "../Chat";
import { useComposeMessage } from "../../../hooks/chat/useComposeMessage";
import { FaceSmileIcon, PaperAirplaneIcon, PhotoIcon } from "@heroicons/react/24/outline";

interface ComposeMessageProps {
    setImg: React.Dispatch<React.SetStateAction<Img>>;
    img: Img;
}

interface FileInputProps {
    handleImg: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isBlocked: boolean;
}

interface EmojiPickerComponentProps {
    openEmoji: boolean;
    setOpenEmoji: React.Dispatch<React.SetStateAction<boolean>>;
    handleEmoji: (emoji: any) => void;
    isBlocked: boolean;
}

interface MessageTextareaProps {
    text: string;
    setText: React.Dispatch<React.SetStateAction<string>>;
    handleSendText: () => void;
    isBlocked: boolean;
}

interface SendButtonProps {
    handleSendText: () => void;
    isBlocked: boolean;
}

export const ComposeMessage = ({ setImg, img }: ComposeMessageProps) => {
    const { isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
    const { handleImg, handleEmoji, handleSendText, text, setText, openEmoji, setOpenEmoji } = useComposeMessage({ setImg, img });
    const isBlocked = isCurrentUserBlocked || isReceiverBlocked;

    return (
        <div className="mt-auto flex justify-between items-center sm:gap-5 p-5 border-t border-neutral-800">
            <div className="icons flex gap-2 sm:gap-5">
                <FileInput handleImg={handleImg} isBlocked={isBlocked} />
                <EmojiPickerComponent openEmoji={openEmoji} setOpenEmoji={setOpenEmoji} handleEmoji={handleEmoji} isBlocked={isBlocked} />
            </div>
            <MessageTextarea text={text} setText={setText} handleSendText={handleSendText} isBlocked={isBlocked} />
            <SendButton handleSendText={handleSendText} isBlocked={isBlocked} />
        </div>
    );
};

const FileInput = ({ handleImg, isBlocked }: FileInputProps) => (
    <button onClick={() => document.getElementById('file')?.click()} disabled={isBlocked} className="disabled:cursor-not-allowed">
        <PhotoIcon className="text-white size-5" />
        <input type="file" id="file" className="hidden" onChange={handleImg} />
    </button>
);

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

const MessageTextarea = ({ text, setText, handleSendText, isBlocked }: MessageTextareaProps) => (
    <textarea
        placeholder={isBlocked ? 'You cannot send a message' : 'Type a message...'}
        rows={1}
        className="flex-1 bg-neutral-900 border-none outline-none text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed resize-none max-sm:text-sm max-sm:max-w-[70%]"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendText();
            }
        }}
        disabled={isBlocked}
    />
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
