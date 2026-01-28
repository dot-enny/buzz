/**
 * Date helper utilities for message timestamp grouping and formatting
 */

/**
 * Groups messages by date (Today, Yesterday, or specific date)
 */
export function getDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time to midnight for comparison
  const messageDate = new Date(date);
  messageDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);

  if (messageDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (messageDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    // Format as "Month Day, Year" (e.g., "Jan 15, 2026")
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}

/**
 * Checks if two dates are on the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Groups messages by date, returning an array of { date: string, messages: Message[] }
 */
export function groupMessagesByDate(messages: any[]): Array<{ date: string; messages: any[] }> {
  const groups: { [key: string]: any[] } = {};

  messages.forEach((message) => {
    const messageDate = message.createdAt.toDate();
    const dateLabel = getDateLabel(messageDate);

    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }
    groups[dateLabel].push(message);
  });

  // Convert to array format
  return Object.entries(groups).map(([date, msgs]) => ({
    date,
    messages: msgs,
  }));
}

/**
 * Format time for message timestamp (e.g., "2:30 PM")
 */
export function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
