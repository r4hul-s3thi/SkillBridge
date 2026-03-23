import api from './api';
import type { MatchStatus } from '@/types';

export const matchService = {
  getMatches: () => api.get('/matches'),
  updateMatchStatus: (id: number, status: MatchStatus) =>
    api.patch(`/matches/${id}`, { status }),
};
