import { useEffect, useState } from 'react';
import { socketInstance } from '@/shared/lib/socket';

export interface TypingUser {
  userId: string;
  handle: string;
}

export const useTypingIndicator = (conversationId: string) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  useEffect(() => {
    const handleTyping = (data: { conversationId: string; accountId: string; timestamp: string }) => {
      if (data.conversationId !== conversationId) return;
      setTypingUsers(prev => {
        const exists = prev.some(u => u.userId === data.accountId);
        if (exists) return prev;
        return [...prev, { userId: data.accountId, handle: 'User' }];
      });
    };

    const handleStopTyping = (data: { conversationId: string; accountId: string }) => {
      if (data.conversationId !== conversationId) return;
      setTypingUsers(prev => prev.filter(u => u.userId !== data.accountId));
    };

    socketInstance.on('chat:user_typing', handleTyping);
    socketInstance.on('chat:user_stop_typing', handleStopTyping);

    return () => {
      socketInstance.off('chat:user_typing', handleTyping);
      socketInstance.off('chat:user_stop_typing', handleStopTyping);
      setTypingUsers([]);
    };
  }, [conversationId]);

  return typingUsers;
};
