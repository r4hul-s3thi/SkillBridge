import api from './api';

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),

  loginWithGoogle: (payload: { name: string; email: string; avatar?: string }) =>
    api.post('/auth/oauth', payload),

  loginWithGitHub: (payload: { name: string; email: string; avatar?: string }) =>
    api.post('/auth/oauth', payload),

  updateProfile: (data: { name?: string; bio?: string; location?: string; avatar?: string }) =>
    api.patch('/auth/profile', data),
};
