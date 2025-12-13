import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
    participants: mongoose.Types.ObjectId[];
    isGroup: boolean;
    name?: string;
    lastMessage?: {
        text: string;
        sender: mongoose.Types.ObjectId;
        timestamp: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
    {
        participants: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }],
        isGroup: {
            type: Boolean,
            default: false
        },
        name: {
            type: String,
            trim: true
        },
        lastMessage: {
            text: String,
            sender: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            timestamp: Date
        }
    },
    {
        timestamps: true
    }
);

// Index for efficient participant queries
conversationSchema.index({ participants: 1 });

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
