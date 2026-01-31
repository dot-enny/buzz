import { useState, useMemo, useCallback } from 'react';

interface SearchableMessage {
    id: string;
    text: string;
    senderId: string;
    senderUsername?: string;
    createdAt: {
        toDate: () => Date;
    };
}

interface SearchResult {
    message: SearchableMessage;
    matchIndices: [number, number][]; // Start and end indices of matches
}

export const useMessageSearch = (messages: SearchableMessage[] | null) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [activeResultIndex, setActiveResultIndex] = useState(0);

    // Find all messages that match the search query
    const searchResults = useMemo((): SearchResult[] => {
        if (!searchQuery.trim() || !messages) return [];

        const query = searchQuery.toLowerCase();
        const results: SearchResult[] = [];

        messages.forEach(message => {
            if (!message.text) return;
            
            const text = message.text.toLowerCase();
            const matchIndices: [number, number][] = [];
            
            let startIndex = 0;
            let index = text.indexOf(query, startIndex);
            
            while (index !== -1) {
                matchIndices.push([index, index + query.length]);
                startIndex = index + 1;
                index = text.indexOf(query, startIndex);
            }
            
            if (matchIndices.length > 0) {
                results.push({ message, matchIndices });
            }
        });

        return results;
    }, [messages, searchQuery]);

    // Navigate between search results
    const goToNextResult = useCallback(() => {
        if (searchResults.length === 0) return;
        setActiveResultIndex(prev => 
            prev >= searchResults.length - 1 ? 0 : prev + 1
        );
    }, [searchResults.length]);

    const goToPreviousResult = useCallback(() => {
        if (searchResults.length === 0) return;
        setActiveResultIndex(prev => 
            prev <= 0 ? searchResults.length - 1 : prev - 1
        );
    }, [searchResults.length]);

    // Get the currently active result
    const activeResult = searchResults[activeResultIndex] || null;

    // Open search and reset state
    const openSearch = useCallback(() => {
        setIsSearchOpen(true);
        setSearchQuery('');
        setActiveResultIndex(0);
    }, []);

    // Close search and reset state
    const closeSearch = useCallback(() => {
        setIsSearchOpen(false);
        setSearchQuery('');
        setActiveResultIndex(0);
    }, []);

    // Check if a message ID is the active result
    const isActiveResult = useCallback((messageId: string) => {
        return activeResult?.message.id === messageId;
    }, [activeResult]);

    // Check if a message matches the search
    const getMatchIndices = useCallback((messageId: string): [number, number][] | null => {
        if (!searchQuery.trim()) return null;
        const result = searchResults.find(r => r.message.id === messageId);
        return result?.matchIndices || null;
    }, [searchQuery, searchResults]);

    return {
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        openSearch,
        closeSearch,
        searchResults,
        activeResultIndex,
        activeResult,
        goToNextResult,
        goToPreviousResult,
        isActiveResult,
        getMatchIndices,
        resultCount: searchResults.length,
    };
};
