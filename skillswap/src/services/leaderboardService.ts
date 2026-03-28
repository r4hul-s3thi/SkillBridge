import api from './api';
export const leaderboardService = {
  get: () => api.get('/leaderboard'),
};
