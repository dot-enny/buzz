import { XCircleIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Img } from '../../hooks/chat/useComposeMessage';
import { useMentions } from '../../hooks/chat/useMentions';
import { MentionDropdown } from '../chat/chat-sections/MentionDropdown';

interface MentionUser {
    id: string;
    username: string;
    avatar?: string;
}

interface MessageTextareaProps {
    text: string;
    setText: React.Dispatch<React.SetStateAction<string>>;
    handleSendText: () => void;
    isBlocked: boolean;
    img?: string;
    removeImg: React.Dispatch<React.SetStateAction<Img>>;
    participants?: MentionUser[];
}

export const AutoExpandingTextarea = ({ 
    text, 
    setText, 
    handleSendText, 
    isBlocked, 
    img, 
    removeImg,
    participants 
}: MessageTextareaProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
    
    const { 
        filteredUsers, 
        handleTextChange, 
        insertMention, 
        isMentionActive,
        closeMentions
    } = useMentions(participants);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [text]);

    // Reset selected index when filtered users change
    useEffect(() => {
        setSelectedMentionIndex(0);
    }, [filteredUsers]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        const caretPosition = e.target.selectionStart;
        setText(newText);
        handleTextChange(newText, caretPosition);
    }, [setText, handleTextChange]);

    const handleSelectMention = useCallback((user: MentionUser) => {
        const { newText, newCaretPosition } = insertMention(text, user);
        setText(newText);
        
        // Set caret position after React updates
        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(newCaretPosition, newCaretPosition);
            }
        });
    }, [text, setText, insertMention]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (isMentionActive) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedMentionIndex(prev => 
                    prev >= filteredUsers.length - 1 ? 0 : prev + 1
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedMentionIndex(prev => 
                    prev <= 0 ? filteredUsers.length - 1 : prev - 1
                );
            } else if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (filteredUsers[selectedMentionIndex]) {
                    handleSelectMention(filteredUsers[selectedMentionIndex]);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closeMentions();
            }
        } else {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendText();
            }
        }
    }, [isMentionActive, filteredUsers, selectedMentionIndex, handleSelectMention, closeMentions, handleSendText]);

    return (
        <div className="bg-neutral-900 w-full rounded-lg flex flex-col relative">
            {img && (
                <ImageArea img={img} removeImg={removeImg} />
            )}
            
            {/* Mention dropdown */}
            <MentionDropdown
                isOpen={isMentionActive}
                users={filteredUsers}
                onSelect={handleSelectMention}
                selectedIndex={selectedMentionIndex}
            />
            
            <textarea
                placeholder={isBlocked ? 'You cannot send a message' : 'Type a message...'}
                ref={textareaRef}
                value={text}
                rows={1}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
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
