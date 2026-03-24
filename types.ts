export enum ViewState {
  HOME = 'HOME',
  GAME = 'GAME',
  PROFILE = 'PROFILE',
  SOCIAL = 'SOCIAL',
  WALLET = 'WALLET',
  SUPPORT = 'SUPPORT',
  LOGIN = 'LOGIN',
  SETTINGS = 'SETTINGS',
  TERMS = 'TERMS',
  PRIVACY = 'PRIVACY',
  NOTIFICATIONS = 'NOTIFICATIONS'
}

export type PlanType = 'free' | 'trial' | 'basic' | 'pro' | 'vip';

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  color: string;
  unlocked: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  level: number;
  wins: number;
  losses: number;
  streak: number;
  xp: number;
  subscriptionPlan: PlanType;
  dailyPostsRemaining: number;
  dailyGamesRemaining: number;
  gender: 'Male' | 'Female';
  dob: string;
  location: string;
  achievements: Achievement[];
}

export interface MathProblem {
  question: string;
  answer: number;
  options: number[];
}

export interface WalletInfo {
  network: string;
  address: string;
  icon: string;
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  isOnline: boolean;
  role?: 'support' | 'user';
}

export interface ChatMessage {
  id: string;
  sender: string;
  senderId?: string;
  text?: string; // Optional because it might be media only
  mediaUrl?: string; // The Blob URL for image/video/audio
  timestamp: Date;
  isMe: boolean;
  type: 'text' | 'image' | 'video' | 'audio' | 'location';
  plan?: PlanType;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
}

export interface Post {
  id: string;
  author: string;
  authorHandle: string;
  content: string;
  image?: string;
  likes: number;
  isLiked?: boolean;
  commentsCount: number;
  commentsList?: Comment[];
  avatar: string;
  timeAgo: string;
  plan?: PlanType;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'system' | 'reward';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon?: string;
}