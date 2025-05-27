import EmojiPicker from "emoji-picker-react";
import { useChatStore } from "../../../lib/chatStore";
import { useComposeMessage } from "../../../hooks/chat/useComposeMessage";
import { FaceSmileIcon, PaperAirplaneIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { AutoExpandingTextarea } from "../../ui/AutoExpandingTextarea";
import { useRef } from "react";

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

export const ComposeMessage = () => {
    const { isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
    const { handleImgSelect, img, setImg, handleEmoji, handleSendText, text, setText, openEmoji, setOpenEmoji } = useComposeMessage();
    const isBlocked = isCurrentUserBlocked || isReceiverBlocked;

    return (
        <div className="mt-auto flex justify-between items-center sm:gap-5 p-5 border-t border-neutral-800">
            <div className="icons flex gap-2 sm:gap-5">
                <FileInput handleImgSelect={handleImgSelect} isBlocked={isBlocked} />
                <EmojiPickerComponent openEmoji={openEmoji} setOpenEmoji={setOpenEmoji} handleEmoji={handleEmoji} isBlocked={isBlocked} />
            </div>
            <AutoExpandingTextarea text={text} setText={setText} handleSendText={handleSendText} isBlocked={isBlocked} img={img.url} removeImg={setImg} />
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
