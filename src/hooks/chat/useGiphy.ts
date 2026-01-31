import { useState, useCallback, useEffect, useRef } from 'react';

export interface GiphyGif {
    id: string;
    title: string;
    url: string;
    previewUrl: string;
    width: number;
    height: number;
}

interface GiphyResponse {
    data: Array<{
        id: string;
        title: string;
        images: {
            fixed_height: {
                url: string;
                width: string;
                height: string;
            };
            fixed_height_still: {
                url: string;
            };
            original: {
                url: string;
            };
        };
    }>;
}

// Giphy API key from environment variable
const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY;

const GIPHY_BASE_URL = 'https://api.giphy.com/v1/gifs';

/**
 * Transform Giphy API response to our format
 */
const transformGifs = (data: GiphyResponse['data']): GiphyGif[] => {
    return data.map(gif => ({
        id: gif.id,
        title: gif.title,
        url: gif.images.original.url,
        previewUrl: gif.images.fixed_height.url,
        width: parseInt(gif.images.fixed_height.width),
        height: parseInt(gif.images.fixed_height.height),
    }));
};

/**
 * Hook for Giphy search and trending
 */
export const useGiphy = () => {
    const [gifs, setGifs] = useState<GiphyGif[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const debounceRef = useRef<NodeJS.Timeout>();

    // Fetch trending GIFs
    const fetchTrending = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch(
                `${GIPHY_BASE_URL}/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=g`
            );
            
            if (!response.ok) throw new Error('Failed to fetch trending GIFs');
            
            const data: GiphyResponse = await response.json();
            setGifs(transformGifs(data.data));
        } catch (err) {
            setError('Failed to load GIFs');
            console.error('Giphy error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Search GIFs
    const searchGifs = useCallback(async (query: string) => {
        if (!query.trim()) {
            fetchTrending();
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch(
                `${GIPHY_BASE_URL}/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=20&rating=g`
            );
            
            if (!response.ok) throw new Error('Failed to search GIFs');
            
            const data: GiphyResponse = await response.json();
            setGifs(transformGifs(data.data));
        } catch (err) {
            setError('Failed to search GIFs');
            console.error('Giphy search error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [fetchTrending]);

    // Debounced search
    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
        
        // Clear previous timeout
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        
        // Debounce the search
        debounceRef.current = setTimeout(() => {
            searchGifs(query);
        }, 300);
    }, [searchGifs]);

    // Load trending on mount
    useEffect(() => {
        fetchTrending();
    }, [fetchTrending]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return {
        gifs,
        isLoading,
        error,
        searchQuery,
        setSearchQuery: handleSearchChange,
        refetchTrending: fetchTrending,
    };
};
