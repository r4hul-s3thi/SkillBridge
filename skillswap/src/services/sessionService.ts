import api from './api';
import type { SessionStatus } from '@/types';

export const sessionService = {
  getSessions: () => api.get('/sessions'),
  createSession: (matchId: number, date: string, topic: string, duration: number) =>
    api.post('/sessions', { matchId, date, topic, duration }),
  updateSessionStatus: (id: number, status: SessionStatus) =>
    api.patch(`/sessions/${id}`, { status }),
};
