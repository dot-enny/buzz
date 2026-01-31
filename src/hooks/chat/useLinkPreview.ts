import { useState, useEffect } from 'react';

export interface LinkPreviewData {
    url: string;
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
    favicon?: string;
    isLoading: boolean;
    error: boolean;
}

// Cache for link previews to avoid repeated API calls
const previewCache = new Map<string, LinkPreviewData>();

// URL detection regex - matches http(s) URLs
const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

// YouTube URL patterns
const YOUTUBE_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

// GitHub repo pattern
const GITHUB_REPO_REGEX = /github\.com\/([^\/]+)\/([^\/\s?#]+)/;

/**
 * Extract all URLs from text
 */
export const extractUrls = (text: string): string[] => {
    const matches = text.match(URL_REGEX);
    return matches ? [...new Set(matches)] : [];
};

/**
 * Check if URL is a YouTube video
 */
export const getYouTubeVideoId = (url: string): string | null => {
    const match = url.match(YOUTUBE_REGEX);
    return match ? match[1] : null;
};

/**
 * Check if URL is a GitHub repo
 */
export const getGitHubRepo = (url: string): { owner: string; repo: string } | null => {
    const match = url.match(GITHUB_REPO_REGEX);
    return match ? { owner: match[1], repo: match[2] } : null;
};

/**
 * Fetch link preview data from API
 */
const fetchLinkPreview = async (url: string): Promise<Partial<LinkPreviewData>> => {
    try {
        // Check for YouTube - use thumbnail directly
        const youtubeId = getYouTubeVideoId(url);
        if (youtubeId) {
            return {
                url,
                title: 'YouTube Video',
                image: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
                siteName: 'YouTube',
                favicon: 'https://www.youtube.com/favicon.ico',
            };
        }

        // Check for GitHub - use opengraph.io or similar
        const githubRepo = getGitHubRepo(url);
        if (githubRepo) {
            // Fetch from GitHub API (no auth needed for public repos)
            const response = await fetch(`https://api.github.com/repos/${githubRepo.owner}/${githubRepo.repo}`);
            if (response.ok) {
                const data = await response.json();
                return {
                    url,
                    title: data.full_name,
                    description: data.description || 'No description',
                    image: data.owner?.avatar_url,
                    siteName: 'GitHub',
                    favicon: 'https://github.com/favicon.ico',
                };
            }
        }

        // Generic link preview using jsonlink.io (free, no API key)
        const apiUrl = `https://jsonlink.io/api/extract?url=${encodeURIComponent(url)}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error('Failed to fetch preview');
        }

        const data = await response.json();
        
        return {
            url,
            title: data.title || new URL(url).hostname,
            description: data.description,
            image: data.images?.[0],
            siteName: data.domain || new URL(url).hostname,
            favicon: data.favicon,
        };
    } catch (error) {
        console.error('Link preview error:', error);
        // Return basic fallback
        try {
            const hostname = new URL(url).hostname;
            return {
                url,
                title: hostname,
                siteName: hostname,
                favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
            };
        } catch {
            return { url, error: true };
        }
    }
};

/**
 * Hook to get link preview for a URL
 */
export const useLinkPreview = (url: string | null) => {
    const [preview, setPreview] = useState<LinkPreviewData | null>(null);

    useEffect(() => {
        if (!url) {
            setPreview(null);
            return;
        }

        // Check cache first
        if (previewCache.has(url)) {
            setPreview(previewCache.get(url)!);
            return;
        }

        // Set loading state
        setPreview({
            url,
            isLoading: true,
            error: false,
        });

        // Fetch preview
        fetchLinkPreview(url).then((data) => {
            const previewData: LinkPreviewData = {
                ...data,
                url,
                isLoading: false,
                error: data.error || false,
            };
            
            // Cache the result
            previewCache.set(url, previewData);
            setPreview(previewData);
        });
    }, [url]);

    return preview;
};

/**
 * Hook to get all link previews from a message
 */
export const useMessageLinkPreviews = (text: string) => {
    const [previews, setPreviews] = useState<LinkPreviewData[]>([]);
    const urls = extractUrls(text);

    useEffect(() => {
        if (urls.length === 0) {
            setPreviews([]);
            return;
        }

        // Limit to first 3 URLs to avoid too many API calls
        const urlsToFetch = urls.slice(0, 3);

        // Check cache and fetch missing
        const fetchPreviews = async () => {
            const results: LinkPreviewData[] = [];
            
            for (const url of urlsToFetch) {
                if (previewCache.has(url)) {
                    results.push(previewCache.get(url)!);
                } else {
                    const data = await fetchLinkPreview(url);
                    const previewData: LinkPreviewData = {
                        ...data,
                        url,
                        isLoading: false,
                        error: data.error || false,
                    };
                    previewCache.set(url, previewData);
                    results.push(previewData);
                }
            }
            
            setPreviews(results);
        };

        // Set loading state
        setPreviews(urlsToFetch.map(url => ({
            url,
            isLoading: true,
            error: false,
        })));

        fetchPreviews();
    }, [text]);

    return previews;
};
