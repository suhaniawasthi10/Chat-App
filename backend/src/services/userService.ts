import { User } from '../models/User';

export const userService = {
    async getUserProfile(userId: string) {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            throw new Error('User not found');
        }

        return {
            id: user._id,
            username: user.username,
            email: user.email,
            friends: user.friends
        };
    },

    async searchUsers(query: string, currentUserId: string) {
        const users = await User.find({
            _id: { $ne: currentUserId },
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).select('-password').limit(20);

        return users.map(user => ({
            id: user._id,
            username: user.username,
            email: user.email
        }));
    },

    async listUsers(currentUserId: string) {
        const users = await User.find({ _id: { $ne: currentUserId } })
            .select('-password')
            .limit(50);

        return users.map(user => ({
            id: user._id,
            username: user.username,
            email: user.email
        }));
    }
};
