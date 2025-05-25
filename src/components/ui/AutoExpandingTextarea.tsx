import React, { useEffect, useRef } from 'react';

interface MessageTextareaProps {
    text: string;
    setText: React.Dispatch<React.SetStateAction<string>>;
    handleSendText: () => void;
    isBlocked: boolean;
}

function AutoExpandingTextarea({ text, setText, handleSendText, isBlocked }: MessageTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [text]);

    return (
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
    );
}

export default AutoExpandingTextarea;