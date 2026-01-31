import React from 'react';
import { parseMentions } from '../../hooks/chat/useMentions';
import { useUserStore } from '../../lib/userStore';

interface MentionTextProps {
    text: string;
    participants?: { id: string; username: string; avatar?: string }[];
    className?: string;
}

/**
 * Renders text with highlighted @mentions
 */
export const MentionText: React.FC<MentionTextProps> = ({
    text,
    participants,
    className = ''
}) => {
    const { currentUser } = useUserStore();
    const segments = parseMentions(text, participants);

    return (
        <span className={className}>
            {segments.map((segment, index) => {
                if (segment.type === 'mention') {
                    // Check if this mention is for the current user
                    const isMentioningMe = segment.userId === currentUser?.id ||
                        segment.content.toLowerCase() === `@${currentUser?.username?.toLowerCase()}`;
                    
                    return (
                        <span
                            key={index}
                            className={`font-medium ${
                                isMentioningMe 
                                    ? 'bg-blue-500/30 text-blue-300 px-1 rounded' 
                                    : 'text-blue-400'
                            }`}
                        >
                            {segment.content}
                        </span>
                    );
                }
                return <span key={index}>{segment.content}</span>;
            })}
        </span>
    );
};
