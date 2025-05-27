import { XCircleIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useRef } from 'react';
import { Img } from '../../hooks/chat/useComposeMessage';

interface MessageTextareaProps {
    text: string;
    setText: React.Dispatch<React.SetStateAction<string>>;
    handleSendText: () => void;
    isBlocked: boolean;
    img?: string;
    removeImg: React.Dispatch<React.SetStateAction<Img>>;
}

export const AutoExpandingTextarea = ({ text, setText, handleSendText, isBlocked, img, removeImg }: MessageTextareaProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [text]);

    return (
        <div className="bg-neutral-900 w-full rounded-lg flex flex-col">
            {img && (
                <ImageArea img={img} removeImg={removeImg} />
            )}
            <textarea
                placeholder={isBlocked ? 'You cannot send a message' : 'Type a message...'}
                ref={textareaRef}
                value={text}
                rows={1}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendText();
                    }
                }}
                disabled={isBlocked}
                className="bg-neutral-900 resize-none max-h-32 w-full flex-1 border-none outline-none text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed max-sm:text-sm max-sm:max-w-[70%]"
            />
        </div>
    );
}

const ImageArea = ({ img, removeImg }: { img: string, removeImg: React.Dispatch<React.SetStateAction<Img>> }) => {

    const handleRemoveImg = () => {
        removeImg({ file: null, url: "" });
    }
    return (
        <div className="message max-w-[70%] gap-5 self-start m-3 relative">
            <button className="absolute right-0 hover:bg-neutral-700 rounded-full transition" onClick={handleRemoveImg}>
                <XCircleIcon className="size-8" />
            </button>
            <div className="texts flex-1 flex flex-col gap-1">
                <img src={img} alt="user" className="rounded-lg object-cover" />
            </div>
        </div>
    )
}
