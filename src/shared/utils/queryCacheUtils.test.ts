import { describe, it, expect } from 'vitest';
import { updateMessagePages, updateConversationList } from '@/shared/utils/queryCacheUtils';

describe('queryCacheUtils', () => {
  describe('updateMessagePages', () => {
    it('should prepend a new message to the first page if it is an array', () => {
      const old = {
        pages: [
          [{ id: 'msg-2', content: 'hello' }]
        ]
      };
      const newMessage = { id: 'msg-1', content: 'new message' };
      
      const result = updateMessagePages(old as any, newMessage as any);
      
      expect((result!.pages[0] as any)).toHaveLength(2);
      expect((result!.pages[0] as any)[0].id).toBe('msg-1');
      expect((result!.pages[0] as any)[1].id).toBe('msg-2');
    });

    it('should replace a temporary message if removeTempId is provided', () => {
      const old = {
        pages: [
          [{ id: 'temp-1', content: 'sending...' }]
        ]
      };
      const newMessage = { id: 'msg-1', content: 'sent' };
      
      const result = updateMessagePages(old as any, newMessage as any, 'temp-1');
      
      expect((result!.pages[0] as any)).toHaveLength(1);
      expect((result!.pages[0] as any)[0].id).toBe('msg-1');
    });

    it('should not add the message again if it already exists', () => {
      const old = {
        pages: [
          [{ id: 'msg-1', content: 'hello' }]
        ]
      };
      const newMessage = { id: 'msg-1', content: 'updated hello' };
      
      const result = updateMessagePages(old as any, newMessage as any);
      
      expect((result!.pages[0] as any)).toHaveLength(1);
    });
  });

  describe('updateConversationList', () => {
    it('should move the updated conversation to the top and update lastMessage', () => {
      const old = [
        { id: 'conv-2', lastMessage: null },
        { id: 'conv-1', lastMessage: null }
      ];
      const newMessage = { id: 'msg-1', conversationId: 'conv-1', content: 'hey', createdAt: '2025-01-01T00:00:00Z' };

      const result = updateConversationList(old as any, 'conv-1', newMessage as any);
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('conv-1');
      expect(result[0].lastMessage.content).toBe('hey');
      expect(result[1].id).toBe('conv-2');
    });

    it('should support custom updater function', () => {
      const old = [
        { id: 'conv-1', unreadCount: 0 }
      ];
      
      const result = updateConversationList(old as any, 'conv-1', null as any, (c: any) => ({
        ...c,
        unreadCount: c.unreadCount + 1
      }));
      
      expect(result[0].unreadCount).toBe(1);
    });
  });
});
