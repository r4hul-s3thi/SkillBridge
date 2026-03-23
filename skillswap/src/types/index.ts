export type SkillType = 'offer' | 'want';
export type SessionStatus = 'pending' | 'accepted' | 'rejected' | 'completed';
export type MatchStatus = 'pending' | 'active';

export interface User {
  id: number;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  location?: string;
  rating: number;
  totalSessions: number;
}

export interface Skill {
  id: number;
  userId: number;
  skillName: string;
  type: SkillType;
  level?: string;
}

export interface Match {
  id: number;
  user1Id: number;
  user2Id: number;
  status: MatchStatus;
  matchedUser: User;
  matchedSkills: { offer: string[]; want: string[] };
  compatibilityScore: number;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  message: string;
  createdAt: string;
}

export interface Conversation {
  id: number;
  participant: User;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Session {
  id: number;
  matchId: number;
  date: string;
  status: SessionStatus;
  participant: User;
  topic: string;
  duration: number;
}

export interface Rating {
  id: number;
  fromUser: User;
  toUserId: number;
  rating: number;
  feedback: string;
  createdAt: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  token: string;
  bio?: string;
  location?: string;
  rating?: number;
  totalSessions?: number;
}
