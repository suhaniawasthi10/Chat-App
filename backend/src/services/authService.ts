import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { generateToken } from '../utils/jwt';

export const authService = {
    async register(username: string, email: string, password: string) {
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            throw new Error('User with this email or username already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            friends: []
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id.toString());

        return {
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            token
        };
    },

    async login(username: string, password: string) {
        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            throw new Error('Invalid username or password');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid username or password');
        }

        // Generate token
        const token = generateToken(user._id.toString());

        return {
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            token
        };
    }
};
