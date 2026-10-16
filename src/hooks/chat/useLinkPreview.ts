import { useState, useEffect, useMemo } from 'react';

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

// Cache configuration
const CACHE_NAME = 'link-preview-cache-v1';
const SESSION_CACHE_PREFIX = 'lp_cache_';

// In-memory L1 cache for synchronous initial state & instant lookups within the same session
const memoryCache = new Map<string, LinkPreviewData>();

// In-flight request deduplication map to prevent concurrent duplicate network requests for the same URL
const inFlightRequests = new Map<string, Promise<LinkPreviewData>>();

// URL detection regex - matches http(s) URLs
const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

// YouTube URL patterns
const YOUTUBE_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

// GitHub repo pattern
const GITHUB_REPO_REGEX = /github\.com\/([^/]+)\/([^/\s?#]+)/;

// GitHub profile pattern (just username, no repo)
const GITHUB_PROFILE_REGEX = /github\.com\/([^/\s?#]+)\/?$/;

/**
 * Validate that a URL is a valid HTTP or HTTPS URL (required by the Cache API)
 */
const isValidHttpUrl = (url: string): boolean => {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
};

/**
 * Check if the browser supports the native Cache API
 */
const isCacheApiSupported = (): boolean => {
    return typeof window !== 'undefined' && 'caches' in window;
};

/**
 * Check if sessionStorage is available
 */
const isSessionStorageSupported = (): boolean => {
    return typeof window !== 'undefined' && 'sessionStorage' in window;
};

/**
 * Read link preview data from persistent cache (Cache API with sessionStorage fallback)
 */
export const readFromCache = async (url: string): Promise<LinkPreviewData | null> => {
    // 1. Check in-memory L1 cache first for fastest response
    if (memoryCache.has(url)) {
        return memoryCache.get(url)!;
    }

    // 2. Try browser native Cache API (persists across reloads, hard refreshes, and tabs)
    if (isCacheApiSupported() && isValidHttpUrl(url)) {
        try {
            const cache = await window.caches.open(CACHE_NAME);
            const cachedResponse = await cache.match(url);
            if (cachedResponse) {
                const data: LinkPreviewData = await cachedResponse.json();
                memoryCache.set(url, data);
                return data;
            }
        } catch (err) {
            console.warn('[LinkPreview] Cache API read error, falling back:', err);
        }
    }

    // 3. Fallback to sessionStorage if Cache API is unavailable or had no match
    if (isSessionStorageSupported()) {
        try {
            const cachedJson = window.sessionStorage.getItem(`${SESSION_CACHE_PREFIX}${url}`);
            if (cachedJson) {
                const data: LinkPreviewData = JSON.parse(cachedJson);
                memoryCache.set(url, data);
                return data;
            }
        } catch (err) {
            console.warn('[LinkPreview] sessionStorage read error:', err);
        }
    }

    return null;
};

/**
 * Save link preview data to persistent cache (Cache API with sessionStorage fallback)
 */
export const writeToCache = async (url: string, data: LinkPreviewData): Promise<void> => {
    // 1. Update in-memory L1 cache
    memoryCache.set(url, data);

    // 2. Write to browser native Cache API
    if (isCacheApiSupported() && isValidHttpUrl(url)) {
        try {
            const cache = await window.caches.open(CACHE_NAME);
            const response = new Response(JSON.stringify(data), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Cached-At': new Date().toISOString(),
                },
            });
            await cache.put(url, response);
        } catch (err) {
            console.warn('[LinkPreview] Cache API write error, falling back:', err);
        }
    }

    // 3. Also write to sessionStorage as fallback
    if (isSessionStorageSupported()) {
        try {
            window.sessionStorage.setItem(`${SESSION_CACHE_PREFIX}${url}`, JSON.stringify(data));
        } catch (err) {
            console.warn('[LinkPreview] sessionStorage write error:', err);
        }
    }
};

/**
 * Clear link preview cache across memory, Cache API, and sessionStorage
 */
export const clearLinkPreviewCache = async (): Promise<void> => {
    memoryCache.clear();
    inFlightRequests.clear();

    if (isCacheApiSupported()) {
        try {
            await window.caches.delete(CACHE_NAME);
        } catch (err) {
            console.warn('[LinkPreview] Error deleting Cache API cache:', err);
        }
    }

    if (isSessionStorageSupported()) {
        try {
            const keysToRemove: string[] = [];
            for (let i = 0; i < window.sessionStorage.length; i++) {
                const key = window.sessionStorage.key(i);
                if (key && key.startsWith(SESSION_CACHE_PREFIX)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach((key) => window.sessionStorage.removeItem(key));
        } catch (err) {
            console.warn('[LinkPreview] Error clearing sessionStorage:', err);
        }
    }
};

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
 * Check if URL is a GitHub profile (not a repo)
 */
export const getGitHubProfile = (url: string): string | null => {
    // First check it's not a repo
    if (GITHUB_REPO_REGEX.test(url)) return null;
    const match = url.match(GITHUB_PROFILE_REGEX);
    return match ? match[1] : null;
};

/**
 * Fetch link preview data from API
 */
const fetchLinkPreview = async (url: string): Promise<Partial<LinkPreviewData>> => {
    try {
        // Check for YouTube - fetch actual title from oEmbed API
        const youtubeId = getYouTubeVideoId(url);
        if (youtubeId) {
            try {
                // Use YouTube oEmbed to get real title
                const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`;
                const response = await fetch(oembedUrl);
                if (response.ok) {
                    const data = await response.json();
                    return {
                        url,
                        title: data.title || 'YouTube Video',
                        description: data.author_name ? `by ${data.author_name}` : undefined,
                        image: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
                        siteName: 'YouTube',
                        favicon: 'https://www.youtube.com/favicon.ico',
                    };
                }
            } catch {
                // Fallback if oEmbed fails
            }
            return {
                url,
                title: 'YouTube Video',
                image: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
                siteName: 'YouTube',
                favicon: 'https://www.youtube.com/favicon.ico',
            };
        }

        // Check for GitHub profile
        const githubProfile = getGitHubProfile(url);
        if (githubProfile) {
            try {
                const response = await fetch(`https://api.github.com/users/${githubProfile}`);
                if (response.ok) {
                    const data = await response.json();
                    return {
                        url,
                        title: data.name || data.login,
                        description: data.bio || `${data.public_repos} public repos · ${data.followers} followers`,
                        image: data.avatar_url,
                        siteName: 'GitHub',
                        favicon: 'https://github.com/favicon.ico',
                    };
                }
            } catch {
                // Fall through to generic preview
            }
        }

        // Check for GitHub repo
        const githubRepo = getGitHubRepo(url);
        if (githubRepo) {
            try {
                const response = await fetch(`https://api.github.com/repos/${githubRepo.owner}/${githubRepo.repo}`);
                if (response.ok) {
                    const data = await response.json();
                    return {
                        url,
                        title: data.full_name,
                        description: data.description || `⭐ ${data.stargazers_count} · ${data.language || 'Code'}`,
                        image: data.owner?.avatar_url,
                        siteName: 'GitHub',
                        favicon: 'https://github.com/favicon.ico',
                    };
                }
            } catch {
                // Fall through to generic preview
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
 * Retrieve link preview data with persistent caching and in-flight deduplication
 */
export const getCachedLinkPreview = async (url: string): Promise<LinkPreviewData> => {
    // 1. Check in-memory L1 cache immediately
    if (memoryCache.has(url)) {
        const cached = memoryCache.get(url)!;
        console.log(`🟢 CACHE HIT: ${url}`, cached);
        return cached;
    }

    // 2. Prevent duplicate concurrent requests for the same URL
    if (inFlightRequests.has(url)) {
        return inFlightRequests.get(url)!;
    }

    // 3. Create fetch/cache task
    const task = (async () => {
        // Cache Read: check persistent Cache API / sessionStorage
        const cached = await readFromCache(url);
        if (cached) {
            console.log(`🟢 CACHE HIT: ${url}`, cached);
            return cached;
        }

        // Cache Miss: fetch preview data
        console.log(`🔴 CACHE MISS: ${url}`);
        const rawData = await fetchLinkPreview(url);
        const previewData: LinkPreviewData = {
            ...rawData,
            url,
            isLoading: false,
            error: rawData.error || false,
        };

        // Cache Write: save to persistent cache
        await writeToCache(url, previewData);
        return previewData;
    })();

    inFlightRequests.set(url, task);
    try {
        return await task;
    } finally {
        inFlightRequests.delete(url);
    }
};

/**
 * Hook to get link preview for a single URL
 */
export const useLinkPreview = (url: string | null) => {
    // Initialize with memory cached data if available (prevents layout shift / skeleton flicker)
    const [preview, setPreview] = useState<LinkPreviewData | null>(() => {
        if (!url || typeof window === 'undefined') return null;
        return memoryCache.get(url) || null;
    });

    useEffect(() => {
        let isCancelled = false;

        if (!url) {
            setPreview(null);
            return;
        }

        // If we don't have it in memory yet, set loading state
        if (!memoryCache.has(url)) {
            setPreview({
                url,
                isLoading: true,
                error: false,
            });
        }

        // Retrieve preview (Cache API read or network fetch)
        getCachedLinkPreview(url)
            .then((data) => {
                if (!isCancelled) {
                    setPreview(data);
                }
            })
            .catch(() => {
                if (!isCancelled) {
                    setPreview({
                        url,
                        isLoading: false,
                        error: true,
                    });
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [url]);

    return preview;
};

/**
 * Hook to get all link previews from a message
 */
export const useMessageLinkPreviews = (text: string) => {
    // Stable key for URLs in the text (up to 3) to prevent re-fetching on keystrokes that don't alter URLs
    const urlsKey = useMemo(() => {
        if (!text) return '';
        return extractUrls(text).slice(0, 3).join('|');
    }, [text]);

    // Stable array of URLs that only re-evaluates when urlsKey changes
    const urls = useMemo(() => {
        return urlsKey ? urlsKey.split('|') : [];
    }, [urlsKey]);

    // Initialize with memory cache if already populated
    const [previews, setPreviews] = useState<LinkPreviewData[]>(() => {
        if (!text || typeof window === 'undefined') return [];
        const initialUrls = extractUrls(text).slice(0, 3);
        return initialUrls
            .map((url) => memoryCache.get(url))
            .filter((p): p is LinkPreviewData => Boolean(p));
    });

    useEffect(() => {
        let isCancelled = false;

        if (urls.length === 0) {
            setPreviews((prev) => (prev.length === 0 ? prev : []));
            return;
        }

        // Check if all requested URLs are already in memory
        const inMemory = urls.map((url) => memoryCache.get(url));
        const allCachedInMemory = inMemory.every((item): item is LinkPreviewData => Boolean(item));

        if (allCachedInMemory) {
            setPreviews(inMemory as LinkPreviewData[]);
        } else {
            // Only set loading for URLs not yet available in memory
            setPreviews(
                urls.map((url) => {
                    const mem = memoryCache.get(url);
                    return (
                        mem || {
                            url,
                            isLoading: true,
                            error: false,
                        }
                    );
                })
            );
        }

        // Fetch / retrieve previews in parallel
        Promise.all(urls.map((url) => getCachedLinkPreview(url)))
            .then((results) => {
                if (!isCancelled) {
                    setPreviews(results);
                }
            })
            .catch((err) => {
                console.error('[LinkPreview] Error loading previews:', err);
            });

        return () => {
            isCancelled = true;
        };
    }, [urls]);

    return previews;
};
