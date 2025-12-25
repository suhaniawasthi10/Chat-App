import { z } from 'zod';

// ============================================
// Auth Schemas
// ============================================

export const registerSchema = z.object({
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be at most 30 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z
        .string()
        .email('Invalid email address'),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password is too long')
});

export const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required')
});

// ============================================
// Message Schemas
// ============================================

export const sendMessageSchema = z.object({
    conversationId: z.string().min(1, 'Conversation ID is required'),
    text: z
        .string()
        .min(1, 'Message cannot be empty')
        .max(5000, 'Message is too long (max 5000 characters)')
});

// ============================================
// Friend Schemas
// ============================================

export const sendFriendRequestSchema = z.object({
    toUserId: z.string().min(1, 'User ID is required')
});

export const handleFriendRequestSchema = z.object({
    requestId: z.string().min(1, 'Request ID is required')
});

// ============================================
// Conversation Schemas
// ============================================

export const createConversationSchema = z.object({
    participantIds: z
        .array(z.string())
        .min(1, 'At least one participant is required'),
    isGroup: z.boolean().optional().default(false),
    name: z.string().max(100).optional()
});

// ============================================
// Type Exports (auto-generated from schemas)
// ============================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type SendFriendRequestInput = z.infer<typeof sendFriendRequestSchema>;
export type HandleFriendRequestInput = z.infer<typeof handleFriendRequestSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;

// ============================================
// Validation Helper
// ============================================

export const validate = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } => {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, error: result.error.issues[0].message };
};
