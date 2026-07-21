import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    platform: {
        type: String,
        enum: ['telegram', 'discord', 'facebook', 'facebook_mock'],
        required: true
    },
    platformAccountName: {
        type: String,
        required: true
    },
    config: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

accountSchema.index({ userId: 1, platform: 1, platformAccountName: 1 }, { unique: true });

const Account = mongoose.model('Account', accountSchema);
export default Account;