import api from './api';

export const collabService = {
  getPosts: () => api.get('/collabs'),
  getMyPosts: () => api.get('/collabs/mine'),
  createPost: (data: { title: string; description: string; skillsHave: string[]; skillsNeeded: string[]; projectType?: string }) =>
    api.post('/collabs', data),
  deletePost: (id: number) => api.delete(`/collabs/${id}`),
  toggleStatus: (id: number, status: 'open' | 'closed') => api.patch(`/collabs/${id}/status`, { status }),
  getRequests: (postId: number) => api.get(`/collabs/${postId}/requests`),
  sendRequest: (postId: number, message?: string) => api.post(`/collabs/${postId}/requests`, { message }),
  updateRequest: (requestId: number, status: 'accepted' | 'rejected') => api.patch(`/collabs/requests/${requestId}`, { status }),
};
