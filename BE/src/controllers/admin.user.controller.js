import HttpStatus from "../errors/httpStatus.js";
import UserService from "../services/user.service.js";
import AppError from "../errors/appError.js";
import ErrorCodes from "../errors/errorCodes.js";
import User from "../models/user.model.js";
import Account from "../models/account.model.js";
import Post from "../models/post.model.js";

const AdminUserController = {
    getAllUsers: async (req, res) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 20;

            const filter = {};

            if (req.query.plan) {
                filter.plan = req.query.plan;
            }

            if (req.query.search) {
                filter.$or = [
                    { name: { $regex: req.query.search, $options: 'i' } },
                    { email: { $regex: req.query.search, $options: 'i' } }
                ];
            }

            const skip = (page - 1) * limit;
            const total = await User.countDocuments(filter);
            const users = await User.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('-password');

            return res.status(HttpStatus.OK).json({
                message: "Fetched users successfully",
                data: {
                    users,
                    total,
                    page,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error",
                errorCode: ErrorCodes.SYS_001
            });
        }
    },

    getUserDetail: async (req, res) => {
        try {
            const userId = req.params.id;
            const user = await User.findById(userId).select('-password');
            if (!user) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    message: "User not found",
                    errorCode: ErrorCodes.USER_001
                });
            }

            const accounts = await Account.find({ userId }).select('-config');
            const posts = await Post.find({ userId }).sort({ createdAt: -1 });

            return res.status(HttpStatus.OK).json({
                message: "User details fetched successfully",
                data: {
                    user,
                    accounts,
                    posts
                }
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error",
                errorCode: ErrorCodes.SYS_001
            });
        }
    },

    banUser: async (req, res) => {
        try {
            const userId = req.params.id;
            const { isBanned } = req.body;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    message: "User not found",
                    errorCode: ErrorCodes.USER_001
                });
            }

            user.isBanned = Boolean(isBanned);
            await user.save();

            return res.status(HttpStatus.OK).json({
                message: user.isBanned ? "User has been banned" : "User has been unbanned",
                data: user
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error",
                errorCode: ErrorCodes.SYS_001
            });
        }
    },

    upgradeUserPlan: async (req, res) => {
        try {
            const userId = req.params.id;
            const { plan, durationDays } = req.body;

            if (plan !== 'pro') {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    message: "Invalid plan",
                    errorCode: ErrorCodes.INVALID_INPUT
                });
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    message: "User not found",
                    errorCode: ErrorCodes.USER_001
                });
            }

            user.plan = 'pro';
            const extraMs = (durationDays || 30) * 24 * 60 * 60 * 1000;
            
            // If already pro and not expired, extend from planExpiredAt
            if (user.planExpiredAt && user.planExpiredAt > Date.now()) {
                user.planExpiredAt = new Date(user.planExpiredAt.getTime() + extraMs);
            } else {
                user.planExpiredAt = new Date(Date.now() + extraMs);
            }

            await user.save();

            return res.status(HttpStatus.OK).json({
                message: `User upgraded to pro plan successfully for ${durationDays || 30} days`,
                data: user
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error",
                errorCode: ErrorCodes.SYS_001
            });
        }
    },

    deleteUser: async (req, res) => {
        try {
            const userId = req.params.id;
            
            const user = await User.findById(userId);
            if (!user) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    message: "User not found",
                    errorCode: ErrorCodes.USER_001
                });
            }

            // Delete cascading
            await Account.deleteMany({ userId });
            await Post.deleteMany({ userId });
            // Should also delete any jobs in BullMQ, but it's hard to query by userId directly in BullMQ unless mapped.
            // For now, deleting posts is done via mongoose, but we might want to iterate and use PostService.delete if we want to cancel jobs.
            // To be thorough, we can fetch all posts and use PostService.delete. Let's do it safely.
            const PostService = (await import('../services/post.service.js')).default;
            const posts = await Post.find({ userId });
            for (const post of posts) {
                await PostService.delete(userId, post._id);
            }

            await User.findByIdAndDelete(userId);

            return res.status(HttpStatus.OK).json({
                message: "User and all associated data deleted successfully"
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error",
                errorCode: ErrorCodes.SYS_001
            });
        }
    }
};

export default AdminUserController;
