import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Skill, Match, Conversation, Session, Rating, MatchStatus } from '@/types';

interface AppState {
  skills: Skill[];
  matches: Match[];
  conversations: Conversation[];
  sessions: Session[];
  ratings: Rating[];
  setSkills: (skills: Skill[]) => void;
  addSkill: (skill: Skill) => void;
  removeSkill: (id: number) => void;
  setMatches: (matches: Match[]) => void;
  updateMatchStatus: (id: number, status: MatchStatus) => void;
  setConversations: (conversations: Conversation[]) => void;
  setSessions: (sessions: Session[]) => void;
  setRatings: (ratings: Rating[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      skills: [],
      matches: [],
      conversations: [],
      sessions: [],
      ratings: [],
      setSkills: (skills) => set({ skills }),
      addSkill: (skill) => set((state) => ({ skills: [...state.skills, skill] })),
      removeSkill: (id) =>
        set((state) => ({ skills: state.skills.filter((s) => s.id !== id) })),
      setMatches: (matches) => set({ matches }),
      updateMatchStatus: (id, status) =>
        set((state) => ({
          matches: state.matches.map((m) => (m.id === id ? { ...m, status } : m)),
        })),
      setConversations: (conversations) => set({ conversations }),
      setSessions: (sessions) => set({ sessions }),
      setRatings: (ratings) => set({ ratings }),
    }),
    { name: 'skillswap-app' }
  )
);
