import mongoose from 'mongoose';

// ============================================
// User Types
// ============================================

export interface UserResponse {
    id: string;
    username: string;
    email: string;
}

export interface UserWithFriends extends UserResponse {
    friends: string[];
}

export interface UserProfile extends UserResponse {
    friends: mongoose.Types.ObjectId[];
    lastActive?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// Authentication Types
// ============================================

export interface AuthResponse {
    user: UserResponse;
    token: string;
}

export interface JwtPayload {
    userId: string;
    iat?: number;
    exp?: number;
}

// ============================================
// Message Types
// ============================================

export interface MessageSender {
    id: string;
    username: string;
    email?: string;
}

export interface MessageResponse {
    id: string;
    conversation: string;
    sender: MessageSender;
    text: string;
    createdAt: Date;
}

// ============================================
// Conversation Types
// ============================================

export interface ConversationParticipant {
    id: string;
    username: string;
    email: string;
    lastActive?: Date;
}

export interface LastMessage {
    text: string;
    sender: MessageSender;
    timestamp: Date;
}

export interface ConversationResponse {
    id: string;
    participants: ConversationParticipant[];
    isGroup: boolean;
    name?: string;
    lastMessage?: LastMessage;
    createdAt: Date;
}

// ============================================
// Friend Request Types
// ============================================

export interface FriendRequestFrom {
    id: string;
    username: string;
    email: string;
}

export interface FriendRequestResponse {
    id: string;
    from: FriendRequestFrom;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
}

export interface FriendRequestResult {
    id: string;
    from: string;
    to: string;
    status: string;
    createdAt: Date;
}

// ============================================
// API Error Types
// ============================================

export interface ApiError {
    error: string;
    stack?: string;
}

// ============================================
// Webhook Types
// ============================================

export interface WebhookPayload {
    conversationId: string;
    senderId: string;
    senderUsername: string;
    text: string;
    timestamp: Date;
}
