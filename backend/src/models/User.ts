import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    friends: mongoose.Types.ObjectId[];
    lastActive: Date;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 30
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        friends: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        lastActive: { // Added lastActive to schema definition
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

export const User = mongoose.model<IUser>('User', userSchema);
