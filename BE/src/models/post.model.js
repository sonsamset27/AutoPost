import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    // Mảng chứa danh sách các tài khoản mạng xã hội sẽ được đăng lên
    accountIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    }],
    content: {
        type: String,
        required: true,
        trim: true
    },
    mediaUrls: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'processing', 'published', 'failed'],
        default: 'draft'
    },
    scheduledAt: {
        type: Date,
        default: null,
        index: true
    },
    bullJobId: {
        type: String,
        default: null,
        index: true,
        sparse: true
    },
    // Hệ thống log được cải tiến: Chỉ đích danh tài khoản bị lỗi
    logs: [{
        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true
        },
        platform: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['success', 'failed'],
            required: true
        },
        errorReason: {
            type: String,
            default: null
        },
        publishedUrl: {
            type: String,
            default: null
        },
        attemptedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

postSchema.index({ userId: 1, scheduledAt: 1 });

const Post = mongoose.model('Post', postSchema);
export default Post;