/**
 * Generate a consistent color based on a string (like username or user ID)
 * Returns one of several predefined colors
 */
export const getAvatarColor = (str: string): string => {
  const colors = [
    'bg-red-700',
    'bg-orange-700',
    'bg-amber-700',
    'bg-yellow-700',
    'bg-lime-700',
    'bg-green-700',
    'bg-emerald-700',
    'bg-teal-700',
    'bg-cyan-700',
    'bg-sky-700',
    'bg-blue-700',
    'bg-indigo-700',
    'bg-violet-700',
    'bg-purple-700',
    'bg-fuchsia-700',
    'bg-pink-700',
    'bg-rose-700',
  ];

  // Generate a consistent index based on the string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Get initials from a name (max 2 characters)
 */
export const getInitials = (name: string): string => {
  if (!name) return '?';
  
  const words = name.trim().split(' ');
  
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};
