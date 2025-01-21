import EmojiPicker from "emoji-picker-react";
import { useChatStore } from "../../../lib/chatStore";
import { IconEmoji } from "../../icons/IconEmoji";
import { IconPhoto } from "../../icons/IconPhoto";
import { Img } from "../Chat";
import { useComposeMessage } from "../../../hooks/chat/useComposeMessage";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";


export const ComposeMessage = ({ setImg, img }: { setImg: React.Dispatch<React.SetStateAction<Img>>, img: Img }) => {
    const { isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
    const { handleImg, handleEmoji, handleSendText, text, setText, openEmoji, setOpenEmoji } = useComposeMessage({ setImg, img });
    const isBlocked = isCurrentUserBlocked || isReceiverBlocked;

    return (
        <div className="bottom mt-auto flex justify-between items-center gap-5 p-5 border-t border-neutral-800">
            <div className="icons flex gap-5">
                <FileInput handleImg={handleImg} />
                <EmojiPickerComponent openEmoji={openEmoji} setOpenEmoji={setOpenEmoji} handleEmoji={handleEmoji} />
            </div>
            <MessageTextarea text={text} setText={setText} handleSendText={handleSendText} isBlocked={isBlocked} />
            <SendButton handleSendText={handleSendText} isBlocked={isBlocked} />
        </div>
    );
};

const FileInput = ({ handleImg }: { handleImg: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <>
        <label htmlFor="file">
            <IconPhoto />
        </label>
        <input type="file" id="file" className="hidden" onChange={handleImg} />
    </>
);

const EmojiPickerComponent = ({ openEmoji, setOpenEmoji, handleEmoji }: { openEmoji: boolean, setOpenEmoji: React.Dispatch<React.SetStateAction<boolean>>, handleEmoji: (emoji: any) => void }) => (
    <div className="emoji relative">
        <div onClick={() => setOpenEmoji(prev => !prev)}>
            <IconEmoji />
        </div>
        {openEmoji && (
            <div className="absolute bottom-12 left-0">
                <EmojiPicker onEmojiClick={handleEmoji} />
            </div>
        )}
    </div>
);

const MessageTextarea = ({ text, setText, handleSendText, isBlocked }: { text: string, setText: React.Dispatch<React.SetStateAction<string>>, handleSendText: () => void, isBlocked: boolean }) => (
    <textarea
        placeholder={isBlocked ? 'You cannot send a message' : 'Type a message...'}
        rows={1}
        className="flex-1 bg-neutral-900 border-none outline-none text-white p-5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed resize-none"
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

const SendButton = ({ handleSendText, isBlocked }: { handleSendText: () => void, isBlocked: boolean }) => (
    <button
        onClick={handleSendText}
        disabled={isBlocked}
        className="text-white p-2 border-none rounded disabled:opacity-50 disabled:cursor-not-allowed"
    >
        <PaperAirplaneIcon className="text-white size-5" />
    </button>
);
