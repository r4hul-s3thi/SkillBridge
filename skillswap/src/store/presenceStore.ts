import { create } from 'zustand';

interface PresenceState {
  onlineUserIds: Set<number>;
  setOnline: (id: number) => void;
  setOffline: (id: number) => void;
  isOnline: (id: number) => boolean;
}

// Simulate realistic online presence — users 2,3,4 are "online" by default
// In a real app this would be a WebSocket. Here we use a shared in-memory store
// that persists across the session and updates every 30s with random fluctuation.
const BASE_ONLINE = new Set([2, 3, 4]);

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUserIds: new Set(BASE_ONLINE),
  setOnline: (id) =>
    set((s) => ({ onlineUserIds: new Set([...s.onlineUserIds, id]) })),
  setOffline: (id) => {
    const next = new Set(get().onlineUserIds);
    next.delete(id);
    set({ onlineUserIds: next });
  },
  isOnline: (id) => get().onlineUserIds.has(id),
}));

// Simulate presence fluctuation every 45s
const ALL_USER_IDS = [2, 3, 4, 5, 6, 7];
setInterval(() => {
  const store = usePresenceStore.getState();
  ALL_USER_IDS.forEach((id) => {
    // 70% chance to be online, 30% offline
    if (Math.random() > 0.3) store.setOnline(id);
    else store.setOffline(id);
  });
}, 45000);
