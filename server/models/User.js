import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    username: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'hr', 'pracownik'],
        default: 'pracownik',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model('User', schema);