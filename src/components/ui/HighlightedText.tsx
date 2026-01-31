import React from 'react';

interface HighlightedTextProps {
    text: string;
    matchIndices: [number, number][] | null | undefined;
    highlightClassName?: string;
    renderMentions?: boolean;
    renderLinks?: boolean;
    hideUrls?: boolean; // Hide URLs when preview is available
}

// URL detection regex
const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;

/**
 * Renders text with highlighted portions based on match indices and optional mention styling
 */
export const HighlightedText: React.FC<HighlightedTextProps> = ({
    text,
    matchIndices,
    highlightClassName = 'bg-yellow-500/40 text-white rounded px-0.5',
    renderMentions = true,
    renderLinks = true,
    hideUrls = false
}) => {
    // If hideUrls is true, remove URLs from text
    const displayText = hideUrls ? text.replace(URL_REGEX, '').trim() : text;
    
    // If text becomes empty after removing URLs, return null
    if (!displayText) {
        return null;
    }

    // First, handle search highlighting
    if (matchIndices && matchIndices.length > 0) {
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;

        // Sort match indices by start position
        const sortedIndices = [...matchIndices].sort((a, b) => a[0] - b[0]);

        sortedIndices.forEach(([start, end], i) => {
            // Add text before match (with mentions)
            if (start > lastIndex) {
                const beforeText = displayText.slice(lastIndex, start);
                parts.push(
                    <RenderWithMentionsAndLinks key={`text-${i}`} text={beforeText} renderMentions={renderMentions} renderLinks={renderLinks} />
                );
            }

            // Add highlighted text
            parts.push(
                <mark key={`highlight-${i}`} className={highlightClassName}>
                    {displayText.slice(start, end)}
                </mark>
            );

            lastIndex = end;
        });

        // Add remaining text (with mentions)
        if (lastIndex < displayText.length) {
            parts.push(
                <RenderWithMentionsAndLinks key="text-end" text={displayText.slice(lastIndex)} renderMentions={renderMentions} renderLinks={renderLinks} />
            );
        }

        return <>{parts}</>;
    }

    // No search highlighting, just render with mentions and links
    return <RenderWithMentionsAndLinks text={displayText} renderMentions={renderMentions} renderLinks={renderLinks} />;
};

// Helper component to render text with @mention and URL styling
const RenderWithMentionsAndLinks: React.FC<{ text: string; renderMentions: boolean; renderLinks: boolean }> = ({ text, renderMentions, renderLinks }) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Combined regex for mentions and URLs
    const combinedRegex = renderMentions && renderLinks 
        ? /(@\w+)|(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g
        : renderMentions 
            ? /@(\w+)/g 
            : renderLinks 
                ? /https?:\/\/[^\s<>"{}|\\^`[\]]+/g 
                : null;

    if (!combinedRegex) {
        return <>{text}</>;
    }

    let match;
    combinedRegex.lastIndex = 0;

    while ((match = combinedRegex.exec(text)) !== null) {
        // Add text before match
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        const matchedText = match[0];
        
        if (matchedText.startsWith('@')) {
            // It's a mention
            parts.push(
                <span key={`mention-${match.index}`} className="text-blue-400 font-medium">
                    {matchedText}
                </span>
            );
        } else if (matchedText.startsWith('http')) {
            // It's a URL - make it clickable
            parts.push(
                <a 
                    key={`link-${match.index}`} 
                    href={matchedText}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline break-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    {matchedText}
                </a>
            );
        }

        lastIndex = match.index + matchedText.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return <>{parts.length > 0 ? parts : text}</>;
};
