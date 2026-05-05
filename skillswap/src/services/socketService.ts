import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';

let socket: Socket | null = null;

export const socketService = {
  connect(userId: number) {
    if (socket?.connected) return socket;
    socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => socket!.emit('user:online', userId));
    return socket;
  },

  disconnect() {
    socket?.disconnect();
    socket = null;
  },

  getSocket() {
    return socket;
  },

  sendMessage(senderId: number, receiverId: number, message: string) {
    socket?.emit('message:send', { senderId, receiverId, message });
  },

  sendTypingStart(senderId: number, receiverId: number) {
    socket?.emit('typing:start', { senderId, receiverId });
  },

  sendTypingStop(senderId: number, receiverId: number) {
    socket?.emit('typing:stop', { senderId, receiverId });
  },

  onMessage(cb: (msg: { id: number; senderId: number; receiverId: number; message: string; createdAt: string }) => void) {
    socket?.on('message:receive', cb);
  },

  onPresenceUpdate(cb: (onlineIds: number[]) => void) {
    socket?.on('presence:update', cb);
  },

  onTypingStart(cb: (data: { senderId: number }) => void) {
    socket?.on('typing:start', cb);
  },

  onTypingStop(cb: (data: { senderId: number }) => void) {
    socket?.on('typing:stop', cb);
  },

  off(event: string) {
    socket?.off(event);
  },
};
