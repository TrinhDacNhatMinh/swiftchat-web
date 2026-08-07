import { create } from 'zustand';

interface PresenceStore {
  onlineUsers: Set<string>;
  setOnline: (userId: string) => void;
  setOffline: (userId: string) => void;
  seedFromFriends: (friends: { id: string; isOnline?: boolean }[]) => void;
}

export const usePresenceStore = create<PresenceStore>((set) => ({
  onlineUsers: new Set(),

  setOnline: (userId) =>
    set((state) => ({ onlineUsers: new Set([...state.onlineUsers, userId]) })),

  setOffline: (userId) =>
    set((state) => {
      const next = new Set(state.onlineUsers);
      next.delete(userId);
      return { onlineUsers: next };
    }),

  /**
   * Initialize presence state from the initial API fetch.
   */
  seedFromFriends: (friends) =>
    set((state) => {
      const next = new Set(state.onlineUsers);
      friends.forEach((f) => {
        if (f.isOnline) next.add(f.id);
        else next.delete(f.id);
      });
      return { onlineUsers: next };
    }),
}));
