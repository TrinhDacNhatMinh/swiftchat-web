import {
  FriendRequestStatus,
  NotificationType,
  ParticipantRole,
} from '@/shared/types/enums';

export interface User {
  id: string; // accountId
  username: string;
  handle: string;
  displayName?: string | null;
  email: string;
  authProvider: string; // AuthProvider enum might be string
  providerId?: string | null;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
  createdAt?: string;
  lastSeen?: string | null;
  bio?: string | null;
  website?: string | null;
  location?: string | null;
  coverUrl?: string | null;
}

export interface Friend {
  id: string; // UUID
  userId1: string;
  userId2: string;
  createdAt: string; // ISO DateTime string
}

export interface FriendRequest {
  id: string; // UUID
  senderId: string;
  receiverId: string;
  status: FriendRequestStatus;
  expiredAt?: string;
}

export interface ParticipantUser {
  id: string;
  handle: string;
  displayName?: string;
  avatarUrl?: string;
  lastSeen?: string;
}

export interface Conversation {
  id: string; // UUID
  type: string;
  displayInfo: {
    title: string | null;
    avatarUrl: string | null;
    isOnline: boolean | null;
  };
  participantPreview: {
    accountId: string;
    handle: string;
    displayName: string | null;
    avatarUrl: string | null;
  }[];
  totalParticipants?: number;
  createdAt?: string;
  updatedAt?: string;
  currentParticipant?: {
    role: string;
    isMuted: boolean;
    mutedUntil: string | null;
    lastReadMessageId: string | null;
  };
  lastMessage?: {
    id: string;
    senderId: string;
    senderName: string | null;
    content: string;
    type: string;
    createdAt: string;
    isUnsent: boolean;
    attachments?: string[];
  };
}

export interface Participant {
  id: string;
  conversationId: string;
  accountId: string;
  role: ParticipantRole;
  joinedAt: string;
  lastReadMessageId?: string;
  hiddenAt?: string | null;
  mutedUntil?: string | null;
  user?: ParticipantUser;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: string;
  createdAt: string;
  updatedAt?: string;
  isUnsent: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  isPinned?: boolean;
  pinnedBy?: string | null;
  pinnedAt?: string | null;
  replyTo?: {
    messageId: string;
    senderId: string;
    content: string;
    type: string;
    isUnsent?: boolean;
  } | null;
  forwardedFrom?: {
    messageId: string;
    conversationId: string;
  } | null;
  reactions?: any[];
  attachments?: any[];
  status?: 'sent' | 'delivered' | 'read'; // Derived from read receipts
  clientTempId?: string; // Optional field for optimistic UI
  isPending?: boolean; // True when message is not yet confirmed by the server
}

export interface NotificationActor {
  id: string;
  handle: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface Notification {
  id: string; // UUID
  userId: string;
  actorId: string;
  type: NotificationType | string;
  referenceId?: string; // ID used for navigation (conversationId, requestId, etc.)
  isRead: boolean;
  title?: string; // Populated from WS payload
  body?: string; // Populated from WS payload
  createdAt: string; // ISO DateTime string
  actor?: NotificationActor; // Populated from API
}
