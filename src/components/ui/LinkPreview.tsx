import { motion } from 'framer-motion';
import { LinkPreviewData, getYouTubeVideoId, getGitHubRepo } from '../../hooks/chat/useLinkPreview';
import { ArrowTopRightOnSquareIcon, PlayIcon } from '@heroicons/react/24/solid';
import { bubblySpring } from './ConnectionStatus';

interface LinkPreviewProps {
    preview: LinkPreviewData;
    isCurrentUser?: boolean;
}

export const LinkPreview = ({ preview, isCurrentUser = false }: LinkPreviewProps) => {
    if (preview.isLoading) {
        return <LinkPreviewSkeleton />;
    }

    if (preview.error || !preview.title) {
        return null;
    }

    const youtubeId = getYouTubeVideoId(preview.url);
    const githubRepo = getGitHubRepo(preview.url);

    // YouTube special layout
    if (youtubeId) {
        return <YouTubePreview preview={preview} isCurrentUser={isCurrentUser} />;
    }

    // GitHub special layout
    if (githubRepo) {
        return <GitHubPreview preview={preview} isCurrentUser={isCurrentUser} />;
    }

    // Generic link preview
    return <GenericPreview preview={preview} isCurrentUser={isCurrentUser} />;
};

// Loading skeleton
const LinkPreviewSkeleton = () => (
    <div className="mt-2 rounded-xl overflow-hidden border border-neutral-700/50 bg-neutral-800/50 animate-pulse">
        <div className="flex gap-3 p-3">
            <div className="w-16 h-16 rounded-lg bg-neutral-700 shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-neutral-700 rounded w-3/4" />
                <div className="h-3 bg-neutral-700 rounded w-full" />
                <div className="h-3 bg-neutral-700 rounded w-1/2" />
            </div>
        </div>
    </div>
);

// YouTube preview with play button overlay
const YouTubePreview = ({ 
    preview, 
    isCurrentUser 
}: { 
    preview: LinkPreviewData; 
    isCurrentUser: boolean;
}) => (
    <motion.a
        href={preview.url}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={bubblySpring}
        className={`mt-2 block rounded-xl overflow-hidden border transition-all hover:border-red-500/50 ${
            isCurrentUser 
                ? 'border-blue-500/30 bg-blue-950/30' 
                : 'border-neutral-700/50 bg-neutral-800/50'
        }`}
    >
        {/* Thumbnail with play button */}
        <div className="relative aspect-video bg-black">
            <img 
                src={preview.image} 
                alt={preview.title}
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors">
                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                    <PlayIcon className="w-8 h-8 text-white ml-1" />
                </div>
            </div>
        </div>
        
        {/* Info */}
        <div className="p-3 flex items-center gap-2">
            <img 
                src={preview.favicon} 
                alt="YouTube"
                className="w-5 h-5 rounded"
            />
            <span className="text-sm text-neutral-400 truncate flex-1">
                {preview.siteName}
            </span>
            <ArrowTopRightOnSquareIcon className="w-4 h-4 text-neutral-500" />
        </div>
    </motion.a>
);

// GitHub repo preview
const GitHubPreview = ({ 
    preview, 
    isCurrentUser 
}: { 
    preview: LinkPreviewData;
    isCurrentUser: boolean;
}) => (
    <motion.a
        href={preview.url}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={bubblySpring}
        className={`mt-2 block rounded-xl overflow-hidden border transition-all hover:border-neutral-500 ${
            isCurrentUser 
                ? 'border-blue-500/30 bg-blue-950/30' 
                : 'border-neutral-700/50 bg-neutral-800/50'
        }`}
    >
        <div className="p-3 flex gap-3">
            {/* Avatar */}
            {preview.image && (
                <img 
                    src={preview.image} 
                    alt=""
                    className="w-12 h-12 rounded-lg shrink-0"
                />
            )}
            
            <div className="flex-1 min-w-0">
                {/* Repo name */}
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
                    </svg>
                    <span className="font-medium text-white truncate">
                        {preview.title}
                    </span>
                </div>
                
                {/* Description */}
                {preview.description && (
                    <p className="text-sm text-neutral-400 mt-1 line-clamp-2">
                        {preview.description}
                    </p>
                )}
                
                {/* Footer */}
                <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                    <img 
                        src={preview.favicon} 
                        alt=""
                        className="w-4 h-4"
                    />
                    <span>GitHub</span>
                </div>
            </div>
            
            <ArrowTopRightOnSquareIcon className="w-4 h-4 text-neutral-500 shrink-0" />
        </div>
    </motion.a>
);

// Generic link preview
const GenericPreview = ({ 
    preview, 
    isCurrentUser 
}: { 
    preview: LinkPreviewData;
    isCurrentUser: boolean;
}) => (
    <motion.a
        href={preview.url}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={bubblySpring}
        className={`mt-2 block rounded-xl overflow-hidden border transition-all hover:border-neutral-500 ${
            isCurrentUser 
                ? 'border-blue-500/30 bg-blue-950/30' 
                : 'border-neutral-700/50 bg-neutral-800/50'
        }`}
    >
        <div className="flex gap-3">
            {/* Image */}
            {preview.image && (
                <div className="w-24 h-24 shrink-0 bg-neutral-700">
                    <img 
                        src={preview.image} 
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                </div>
            )}
            
            <div className="flex-1 min-w-0 p-3">
                {/* Title */}
                <h4 className="font-medium text-white text-sm line-clamp-1">
                    {preview.title}
                </h4>
                
                {/* Description */}
                {preview.description && (
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                        {preview.description}
                    </p>
                )}
                
                {/* Site info */}
                <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                    {preview.favicon && (
                        <img 
                            src={preview.favicon} 
                            alt=""
                            className="w-4 h-4 rounded"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    )}
                    <span className="truncate">{preview.siteName}</span>
                    <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-auto shrink-0" />
                </div>
            </div>
        </div>
    </motion.a>
);
