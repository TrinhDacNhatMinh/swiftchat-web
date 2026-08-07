import { create } from 'zustand';

interface ProfilePanelState {
  isOpen: boolean;
  handle: string | null;
  openProfile: (handle: string) => void;
  closeProfile: () => void;
}

export const useProfilePanelStore = create<ProfilePanelState>((set) => ({
  isOpen: false,
  handle: null,
  openProfile: (handle) => set({ isOpen: true, handle }),
  closeProfile: () => set({ isOpen: false, handle: null }),
}));
