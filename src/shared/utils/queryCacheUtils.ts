import { Message, Conversation } from '@/shared/types/models';
import { InfiniteData, MessagePageData } from '@/shared/types/api';

/**
 * Helper: Extract items array from a generic page response.
 * Handles various pagination response formats seamlessly.
 */
function getPageItems<T>(page: MessagePageData<T>): T[] {
  if (Array.isArray(page)) return page;
  if ('data' in page && Array.isArray(page.data)) return page.data;
  if ('items' in page && Array.isArray(page.items)) return page.items;
  return [];
}

/**
 * Helper: Reconstruct a page object with updated items while preserving other metadata.
 */
function setPageItems<T>(page: MessagePageData<T>, newItems: T[]): MessagePageData<T> {
  if (Array.isArray(page)) return newItems;
  if ('data' in page && Array.isArray(page.data)) return { ...page, data: newItems };
  if ('items' in page && Array.isArray(page.items)) return { ...page, items: newItems };
  return page;
}

/**
 * Prepends a new message to the first page of the infinite query cache.
 * If a `clientTempId` is provided, it removes the optimistic message before adding the confirmed one.
 *
 * @param old Current infinite query cache data
 * @param newMessage The new message to insert
 * @param removeTempId Optional ID of the optimistic message to remove
 * @returns Updated infinite query data
 */
export const updateMessagePages = (
  old: InfiniteData<Message> | undefined,
  newMessage: Message,
  removeTempId?: string,
): InfiniteData<Message> | undefined => {
  if (!old || !old.pages) return old;

  const newPages = [...old.pages];
  if (newPages[0]) {
    let items = getPageItems(newPages[0]);
    if (removeTempId) items = items.filter((msg) => msg.id !== removeTempId);
    const exists = items.some((m) => m.id === newMessage.id);
    if (!exists) items = [newMessage, ...items];
    newPages[0] = setPageItems(newPages[0], items);
  }
  return { ...old, pages: newPages };
};

/**
 * Updates a specific conversation within the cached conversation list.
 * Supports different pagination structures (array, { data }, { items }).
 * 
 * If an `updater` function is provided, it applies to all conversations.
 * Otherwise, it finds the conversation by `convId` and updates its `lastMessage` and `updatedAt`.
 *
 * @param old Current query cache data for conversations
 * @param convId Target conversation ID
 * @param newMessage The new message to set as lastMessage
 * @param updater Optional custom updater function applied to each conversation
 * @returns Updated conversation list data
 */
export const updateConversationList = (
  old: unknown,
  convId: string,
  newMessage: Partial<Message> | null,
  updater?: (conv: Conversation) => Conversation,
): any => {
  if (!old) return old;

  const updateList = (items: Conversation[]): Conversation[] => {
    if (updater) return items.map((c) => updater(c));
    const index = items.findIndex((c) => c.id === convId);
    if (index === -1) return items;
    const updatedConv = {
      ...items[index],
      lastMessage: newMessage as Conversation['lastMessage'],
      updatedAt: newMessage?.createdAt || new Date().toISOString(),
    };
    const newItems = [...items];
    newItems.splice(index, 1);
    newItems.unshift(updatedConv);
    return newItems;
  };

  const o = old as Record<string, unknown>;
  if (Array.isArray(old)) return updateList(old as Conversation[]);
  if (o.data && Array.isArray(o.data)) return { ...o, data: updateList(o.data as Conversation[]) };
  if (o.items && Array.isArray(o.items)) return { ...o, items: updateList(o.items as Conversation[]) };
  return old;
};

/**
 * Finds a message by its ID across all pages in the cache and applies an updater function to it.
 *
 * @param old Current infinite query cache data
 * @param messageId Target message ID to update
 * @param updater Function to apply updates to the matched message
 * @returns Updated infinite query data
 */
export const updateMessageInCache = (
  old: InfiniteData<Message> | undefined,
  messageId: string,
  updater: (msg: Message) => Message,
): InfiniteData<Message> | undefined => {
  if (!old?.pages) return old;
  return {
    ...old,
    pages: old.pages.map((page) => {
      const items = getPageItems(page);
      const updated = items.map((msg) => (msg.id === messageId ? updater(msg) : msg));
      return setPageItems(page, updated);
    }),
  };
};

/**
 * Applies an updater function to all messages in the cache that satisfy a specific condition.
 * Useful for bulk updates like read receipts or marking multiple messages as unsent.
 *
 * @param old Current infinite query cache data
 * @param condition Function to determine if a message should be updated
 * @param updater Function to apply updates to matched messages
 * @returns Updated infinite query data
 */
export const updateMultipleMessagesInCache = (
  old: InfiniteData<Message> | undefined,
  condition: (msg: Message) => boolean,
  updater: (msg: Message) => Message,
): InfiniteData<Message> | undefined => {
  if (!old?.pages) return old;
  return {
    ...old,
    pages: old.pages.map((page) => {
      const items = getPageItems(page);
      const updated = items.map((msg) => (condition(msg) ? updater(msg) : msg));
      return setPageItems(page, updated);
    }),
  };
};

/**
 * Filters out messages that satisfy a specific condition from all pages in the cache.
 * Useful for local deletions (delete-for-me) or hiding specific messages.
 * 
 * @param old Current infinite query cache data
 * @param condition Function to determine if a message should be filtered out
 * @returns Updated infinite query data
 */
export const filterMessagesFromCache = (
  old: InfiniteData<Message> | undefined,
  condition: (msg: Message) => boolean,
): InfiniteData<Message> | undefined => {
  if (!old?.pages) return old;
  return {
    ...old,
    pages: old.pages.map((page) => {
      const items = getPageItems(page);
      const filtered = items.filter((msg) => !condition(msg));
      return setPageItems(page, filtered);
    }),
  };
};
