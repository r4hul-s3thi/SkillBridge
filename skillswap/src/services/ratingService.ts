import api from './api';

export const ratingService = {
  getRatings: () => api.get('/ratings'),
  submitRating: (toUserId: number, rating: number, feedback: string) =>
    api.post('/ratings', { toUserId, rating, feedback }),
};
