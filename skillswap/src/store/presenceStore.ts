import { create } from 'zustand';

interface PresenceState {
  onlineUserIds: Set<number>;
  setOnlineUsers: (ids: number[]) => void;
  isOnline: (id: number) => boolean;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUserIds: new Set(),
  setOnlineUsers: (ids) => set({ onlineUserIds: new Set(ids) }),
  isOnline: (id) => get().onlineUserIds.has(id),
}));
