import api from './api';

export const messageService = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (userId: number) => api.get(`/messages/${userId}`),
  sendMessage: (receiverId: number, message: string) =>
    api.post('/messages', { receiverId, message }),
};
