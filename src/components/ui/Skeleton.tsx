import { classNames } from "../../utils/helpers";

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    width?: string | number;
    height?: string | number;
    animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton = ({ 
    className = '', 
    variant = 'text', 
    width, 
    height,
    animation = 'pulse'
}: SkeletonProps) => {
    const baseClasses = 'bg-neutral-800';
    
    const variantClasses = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: '',
        rounded: 'rounded-lg',
    };
    
    const animationClasses = {
        pulse: 'animate-pulse',
        wave: 'skeleton-wave',
        none: '',
    };
    
    const style: React.CSSProperties = {
        width: width,
        height: height,
    };
    
    return (
        <div 
            className={classNames(
                baseClasses,
                variantClasses[variant],
                animationClasses[animation],
                className
            )}
            style={style}
        />
    );
};

// Pre-built skeleton components for common use cases

export const MessageSkeleton = ({ isOwn = false }: { isOwn?: boolean }) => (
    <div className={classNames(
        "flex gap-3 p-2",
        isOwn ? "flex-row-reverse" : ""
    )}>
        {!isOwn && <Skeleton variant="circular" className="w-10 h-10 shrink-0" />}
        <div className={classNames(
            "flex flex-col gap-2",
            isOwn ? "items-end" : "items-start"
        )}>
            {!isOwn && <Skeleton className="w-20 h-3" />}
            <Skeleton variant="rounded" className="w-48 h-16" />
            <Skeleton className="w-12 h-2" />
        </div>
    </div>
);

export const MessageListSkeleton = () => (
    <div className="flex flex-col gap-4 p-5">
        <MessageSkeleton />
        <MessageSkeleton isOwn />
        <MessageSkeleton />
        <MessageSkeleton />
        <MessageSkeleton isOwn />
        <MessageSkeleton isOwn />
        <MessageSkeleton />
    </div>
);

export const ChatListItemSkeleton = () => (
    <div className="flex items-center gap-4 p-5 border-b border-neutral-800">
        <Skeleton variant="circular" className="w-12 h-12 shrink-0" />
        <div className="flex-1 min-w-0">
            <Skeleton className="w-28 h-4 mb-2" />
            <Skeleton className="w-40 h-3" />
        </div>
    </div>
);

export const ChatListSkeleton = () => (
    <div>
        {[...Array(6)].map((_, i) => (
            <ChatListItemSkeleton key={i} />
        ))}
    </div>
);

export const UserInfoSkeleton = () => (
    <div className="flex items-center gap-4 p-5">
        <Skeleton variant="circular" className="w-12 h-12 shrink-0" />
        <div className="flex-1">
            <Skeleton className="w-24 h-4 mb-2" />
            <Skeleton className="w-16 h-3" />
        </div>
    </div>
);

export const DetailSkeleton = () => (
    <div className="p-5">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
            <Skeleton variant="circular" className="w-24 h-24 mb-4" />
            <Skeleton className="w-32 h-5 mb-2" />
            <Skeleton className="w-20 h-3" />
        </div>
        
        {/* Info sections */}
        <div className="space-y-4">
            <Skeleton variant="rounded" className="w-full h-12" />
            <Skeleton variant="rounded" className="w-full h-12" />
            <Skeleton variant="rounded" className="w-full h-12" />
        </div>
    </div>
);
