import { getAvatarColor, getInitials } from '../../utils/avatarHelpers';
import { UserGroupIcon } from '@heroicons/react/24/solid';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-8 h-8 text-xs',
  sm: 'w-10 h-10 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-24 h-24 text-3xl',
};

export const Avatar = ({ src, name, size = 'md', className = '' }: AvatarProps) => {
  const sizeClass = sizeClasses[size];
  
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} rounded-full object-cover ${className}`}
      />
    );
  }

  const colorClass = getAvatarColor(name);
  const initials = getInitials(name);

  return (
    <div
      className={`${sizeClass} rounded-full ${colorClass} flex items-center justify-center font-semibold text-white ${className}`}
    >
      {initials}
    </div>
  );
};

// For group chats without photos
export const GroupAvatar = ({ src, name = 'Group', size = 'md', className = '' }: { src?: string | null; name?: string; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; className?: string }) => {
  const sizeClass = sizeClasses[size];
  
  if (src) {
    return (
      <img
        src={src}
        alt="Group"
        className={`${sizeClass} rounded-full object-cover ${className}`}
      />
    );
  }

  const colorClass = getAvatarColor(name);
  
  // Icon sizes based on avatar size
  const iconSizes = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
    xl: 'w-12 h-12',
  };
  
  const iconSize = iconSizes[size];

  return (
    <div className={`${sizeClass} rounded-full ${colorClass} flex items-center justify-center ${className}`}>
      <UserGroupIcon className={`${iconSize} text-white`} />
    </div>
  );
};
