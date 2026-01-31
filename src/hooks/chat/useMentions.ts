import { useState, useCallback, useMemo } from 'react';

interface MentionUser {
    id: string;
    username: string;
    avatar?: string;
}

interface MentionState {
    isActive: boolean;
    searchQuery: string;
    startIndex: number; // Position of @ in the text
    caretPosition: number;
}

export const useMentions = (participants: MentionUser[] | undefined) => {
    const [mentionState, setMentionState] = useState<MentionState>({
        isActive: false,
        searchQuery: '',
        startIndex: -1,
        caretPosition: -1,
    });

    // Filter participants based on search query
    const filteredUsers = useMemo(() => {
        if (!mentionState.isActive || !participants) return [];
        
        const query = mentionState.searchQuery.toLowerCase();
        return participants.filter(user => 
            user.username.toLowerCase().includes(query)
        ).slice(0, 5); // Limit to 5 suggestions
    }, [participants, mentionState.isActive, mentionState.searchQuery]);

    // Handle text change - detect @ mentions
    const handleTextChange = useCallback((text: string, caretPosition: number) => {
        // Find the last @ before caret position
        const textBeforeCaret = text.slice(0, caretPosition);
        const lastAtIndex = textBeforeCaret.lastIndexOf('@');
        
        if (lastAtIndex === -1) {
            // No @ found
            if (mentionState.isActive) {
                setMentionState({ isActive: false, searchQuery: '', startIndex: -1, caretPosition: -1 });
            }
            return;
        }

        // Check if @ is at start or after a space (valid mention trigger)
        const charBeforeAt = textBeforeCaret[lastAtIndex - 1];
        const isValidTrigger = lastAtIndex === 0 || charBeforeAt === ' ' || charBeforeAt === '\n';
        
        if (!isValidTrigger) {
            if (mentionState.isActive) {
                setMentionState({ isActive: false, searchQuery: '', startIndex: -1, caretPosition: -1 });
            }
            return;
        }

        // Extract the query after @
        const query = textBeforeCaret.slice(lastAtIndex + 1);
        
        // Check if there's a space after @ (mention completed)
        if (query.includes(' ') || query.includes('\n')) {
            if (mentionState.isActive) {
                setMentionState({ isActive: false, searchQuery: '', startIndex: -1, caretPosition: -1 });
            }
            return;
        }

        // Activate mention mode
        setMentionState({
            isActive: true,
            searchQuery: query,
            startIndex: lastAtIndex,
            caretPosition,
        });
    }, [mentionState.isActive]);

    // Insert a mention into the text
    const insertMention = useCallback((text: string, user: MentionUser): { newText: string, newCaretPosition: number } => {
        if (!mentionState.isActive || mentionState.startIndex === -1) {
            return { newText: text, newCaretPosition: text.length };
        }

        const beforeMention = text.slice(0, mentionState.startIndex);
        const afterMention = text.slice(mentionState.caretPosition);
        const mentionText = `@${user.username} `;
        
        const newText = beforeMention + mentionText + afterMention;
        const newCaretPosition = beforeMention.length + mentionText.length;

        // Close mention mode
        setMentionState({ isActive: false, searchQuery: '', startIndex: -1, caretPosition: -1 });

        return { newText, newCaretPosition };
    }, [mentionState]);

    // Close mentions dropdown
    const closeMentions = useCallback(() => {
        setMentionState({ isActive: false, searchQuery: '', startIndex: -1, caretPosition: -1 });
    }, []);

    return {
        mentionState,
        filteredUsers,
        handleTextChange,
        insertMention,
        closeMentions,
        isMentionActive: mentionState.isActive && filteredUsers.length > 0,
    };
};

// Parse mentions from message text and return formatted segments
export interface TextSegment {
    type: 'text' | 'mention';
    content: string;
    userId?: string;
}

export const parseMentions = (text: string, participants?: MentionUser[]): TextSegment[] => {
    if (!text) return [];
    
    const mentionRegex = /@(\w+)/g;
    const segments: TextSegment[] = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
        // Add text before mention
        if (match.index > lastIndex) {
            segments.push({
                type: 'text',
                content: text.slice(lastIndex, match.index),
            });
        }

        const username = match[1];
        const user = participants?.find(p => p.username.toLowerCase() === username.toLowerCase());

        // Add mention
        segments.push({
            type: 'mention',
            content: `@${username}`,
            userId: user?.id,
        });

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        segments.push({
            type: 'text',
            content: text.slice(lastIndex),
        });
    }

    return segments.length > 0 ? segments : [{ type: 'text', content: text }];
};
