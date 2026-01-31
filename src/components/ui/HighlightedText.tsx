import React from 'react';

interface HighlightedTextProps {
    text: string;
    matchIndices: [number, number][] | null | undefined;
    highlightClassName?: string;
    renderMentions?: boolean;
}

// Simple regex to detect @mentions
const MENTION_REGEX = /@(\w+)/g;

/**
 * Renders text with highlighted portions based on match indices and optional mention styling
 */
export const HighlightedText: React.FC<HighlightedTextProps> = ({
    text,
    matchIndices,
    highlightClassName = 'bg-yellow-500/40 text-white rounded px-0.5',
    renderMentions = true
}) => {
    // First, handle search highlighting
    if (matchIndices && matchIndices.length > 0) {
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;

        // Sort match indices by start position
        const sortedIndices = [...matchIndices].sort((a, b) => a[0] - b[0]);

        sortedIndices.forEach(([start, end], i) => {
            // Add text before match (with mentions)
            if (start > lastIndex) {
                const beforeText = text.slice(lastIndex, start);
                parts.push(
                    <RenderWithMentions key={`text-${i}`} text={beforeText} renderMentions={renderMentions} />
                );
            }

            // Add highlighted text
            parts.push(
                <mark key={`highlight-${i}`} className={highlightClassName}>
                    {text.slice(start, end)}
                </mark>
            );

            lastIndex = end;
        });

        // Add remaining text (with mentions)
        if (lastIndex < text.length) {
            parts.push(
                <RenderWithMentions key="text-end" text={text.slice(lastIndex)} renderMentions={renderMentions} />
            );
        }

        return <>{parts}</>;
    }

    // No search highlighting, just render with mentions
    return <RenderWithMentions text={text} renderMentions={renderMentions} />;
};

// Helper component to render text with @mention styling
const RenderWithMentions: React.FC<{ text: string; renderMentions: boolean }> = ({ text, renderMentions }) => {
    if (!renderMentions) {
        return <>{text}</>;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    
    // Reset regex
    MENTION_REGEX.lastIndex = 0;

    while ((match = MENTION_REGEX.exec(text)) !== null) {
        // Add text before mention
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        // Add styled mention
        parts.push(
            <span key={match.index} className="text-blue-400 font-medium">
                {match[0]}
            </span>
        );

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return <>{parts.length > 0 ? parts : text}</>;
};
