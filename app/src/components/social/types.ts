/**
 * Social Hub - TypeScript Types
 */

export type OnlineStatus = 'online' | 'in-game' | 'offline' | 'watching';

export interface Friend {
  id: string;
  username: string;
  avatar: string;
  level: number;
  status: OnlineStatus;
  currentActivity?: string;
  lastSeen?: string;
  bio?: string;
  followers?: number;
  following?: number;
  likes?: number;
  posts?: number;
  recentActivity?: string;
  tags?: string[];
}

export type MovieCategory = 'free' | 'vip' | 'upcoming';

export interface Movie {
  id: string;
  title: string;
  poster: string;
  duration: string;
  rating: number;
  genre: string;
  description: string;
  category: MovieCategory;
  vipExclusive?: boolean;
}

export interface SeatUser {
  id: string;
  username: string;
  avatar: string;
}

export type MovieDate = 'today' | 'tomorrow' | 'after';

export interface MovieSchedule {
  id: string;
  movieId: string;
  movie: Movie;
  time: string;
  date: MovieDate;
  seats: (SeatUser | null)[];
}

export type ChatMessageType = 'normal' | 'system';

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  type: ChatMessageType;
  timestamp: string;
}

export interface ScriptRole {
  id: string;
  name: string;
  description: string;
  background: string;
  skill: string;
  avatar?: string;
}

export interface Clue {
  id: string;
  title: string;
  content: string;
  revealed?: boolean;
  type?: 'physical' | 'testimony' | 'document' | 'digital';
}

export interface Script {
  id: string;
  title: string;
  type: string;
  players: number;
  duration: string;
  difficulty: '新手' | '进阶' | '专家';
  description: string;
  cover: string;
  roles: ScriptRole[];
  clues: Clue[];
  truth: string;
}

export type GameType = '海龟汤' | '谁是卧底' | '飞行棋';

export interface GameRoom {
  id: string;
  gameType: GameType;
  host: string;
  players: number;
  maxPlayers: number;
  status: 'waiting' | 'playing';
}

export type MMPhase = 'role' | 'reading' | 'discussion1' | 'search1' | 'discussion2' | 'search2' | 'final' | 'voting' | 'ending';

export interface TurtleSoup {
  id: string;
  title: string;
  scenario: string;
  answer: string;
  difficulty: string;
}

export interface ProfilePost {
  id: string;
  image: string;
  title: string;
  likes: number;
}
