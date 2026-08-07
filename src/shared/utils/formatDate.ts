/**
 * Format a date to a relative time string (e.g., "2 minutes ago")
 */
export const formatDistanceToNow = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Format a date for the conversation list using a hybrid approach (like Telegram/iMessage).
 * Automatically adapts to the local timezone via the browser's Date object.
 *
 * @param dateStr The date string or Date object to format
 * @param locale The locale to use for formatting (default: 'vi-VN')
 * @returns A formatted time string
 */
export const formatConversationTime = (dateStr: string | Date, locale: string = 'vi-VN'): string => {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = startOfToday.getTime() - startOfDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  
  if (diffDays === 1) {
    return locale.startsWith('vi') ? 'Hôm qua' : 'Yesterday';
  }
  
  if (diffDays > 1 && diffDays < 7) {
    return date.toLocaleDateString(locale, { weekday: locale.startsWith('vi') ? 'long' : 'short' });
  }
  
  const dd = date.getDate().toString().padStart(2, '0');
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = date.getFullYear();

  if (yyyy === now.getFullYear()) {
    return `${dd}/${mm}`;
  }
  return `${dd}/${mm}/${yyyy}`;
};

/**
 * Format a date for a specific message bubble.
 * 
 * @param dateStr The date string or Date object to format
 * @param t The translation function from i18next
 * @returns A formatted time string tailored for message bubbles
 */
export const formatMessageTime = (dateStr: string | Date, t: any): string => {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  const now = new Date();
  
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  
  if (diffDays === 0) {
    return timeStr;
  }
  
  const day = date.getDate();
  const monthIdx = (date.getMonth() + 1).toString();
  const year = date.getFullYear();
  
  if (diffDays > 0 && diffDays < 7) {
    const weekdayIdx = date.getDay(); // 0-6 (Sun-Sat)
    const weekdayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const weekdayStr = t(`chat.time.weekdays.${weekdayKeys[weekdayIdx]}`);
    return `${weekdayStr} ${timeStr}`;
  }
  
  const monthStr = t(`chat.time.months.${monthIdx}`);
  
  if (year === now.getFullYear()) {
    return t('chat.time.thisYear', '{{day}} {{month}} {{time}}', { day, month: monthStr, time: timeStr });
  }
  
  return t('chat.time.otherYear', '{{day}} {{month}}, {{year}} {{time}}', { day, month: monthStr, year, time: timeStr });
};
