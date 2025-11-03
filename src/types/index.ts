import { Timestamp } from 'firebase/firestore';

// User Types
export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  tokenBalance: number;
  betaGrantedAt?: Timestamp;
  lastTokenUpdateAt?: Timestamp;
  createdAt: Timestamp;
}

export interface TokenTransaction {
  type: 'purchase' | 'use' | 'earn_from_condolence';
  tokens: number;
  jpy?: number;
  source: 'stripe' | 'system';
  stripeEventId?: string;
  related?: string;
  status: 'committed' | 'pending';
  createdAt: Timestamp;
  committedAt?: Timestamp;
}

// Space Types
export interface Space {
  id: string;
  ownerUid: string;
  stewardUid?: string;
  mode: 'life' | 'tribute';
  profile?: {
    displayName: string;
    legalName?: string;
    title?: string;
    bio?: string;
    location?: string;
  };
  cover?: { url: string; alt?: string };
  portrait?: { url: string; year?: number };
  career?: { headline?: string; summary?: string };
  motto?: { text: string; source?: string };
  stats?: { posts: number; relations: number; footprints: number };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Relation {
  status: 'requested' | 'approved' | 'rejected' | 'revoked' | 'blocked';
  requesterUid: string;
  approverUid: string;
  labels: string[];
  approvedAt?: Timestamp;
  updatedAt: Timestamp;
}

export interface ApprovedSpace {
  approvedAt: Timestamp;
  labels: string[];
  ownerUid: string;
}

export interface TimelineItem {
  year: number;
  month?: number;
  title: string;
  description?: string;
  media?: { url: string; type: 'image' | 'video' };
  orderKey: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MusicTrack {
  title: string;
  artist: string;
  youtubeUrl: string;
  note?: string;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Footprint {
  name: string;
  organization?: string;
  lastVisitedAt: Timestamp;
  firstVisitedAt: Timestamp;
  visitCount: number;
}

// Post Types
export type PostType = 'text_short' | 'text_long' | 'photo' | 'video' | 'audio';
export type PostStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'hidden' | 'deleted';

export interface Post {
  id: string;
  spaceId: string;
  ownerUid: string;
  mode: 'life' | 'tribute';
  type: PostType;
  status: PostStatus;
  content?: string;
  mediaUrls?: string[];
  reportCount?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
}

// Condolence Types
export type CondolenceStatus = 'pending' | 'succeeded' | 'refunded' | 'disputed' | 'failed';

export interface Condolence {
  id: string;
  spaceId: string;
  donorUid?: string;
  amount: number;
  fee: number;
  net: number;
  status: CondolenceStatus;
  message?: string;
  name?: string;
  email?: string;
  stripePaymentIntentId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

