import Post from "../models/post.model.js";
import Account from "../models/account.model.js";
import AppError from "../errors/appError.js";
import ErrorCodes from "../errors/errorCodes.js";
import getDriver from "../platformDrivers/registry.js";
import CryptoUtil from "../utils/crypto.util.js";
import { postQueue } from "../queues/post.queue.js";
import User from "../models/user.model.js";

const PostService = {
    create: async (userId, { accountIds, content, mediaUrls, scheduledAt }) => {
        let status = "scheduled";
        let delay = 0;

        if (scheduledAt) {
            delay = new Date(scheduledAt).getTime() - Date.now();
            if (delay <= 0) {
                throw AppError.badRequest(ErrorCodes.INVALID_INPUT, "Thời gian hẹn giờ phải ở tương lai.");
            }
        }

        const user = await User.findById(userId);
        if (!user) throw AppError.notFound(ErrorCodes.USER_001, "User not found");

        if (user.plan === 'free') {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const monthPostsCount = await Post.countDocuments({
                userId,
                createdAt: { $gte: startOfMonth }
            });

            if (monthPostsCount >= 30) {
                throw AppError.forbidden(
                    ErrorCodes.AUTH_003,
                    "Gói Free giới hạn tối đa 30 bài đăng/tháng. Vui lòng nâng cấp lên PRO."
                );
            }

            if (status === 'scheduled') {
                const scheduledPostsCount = await Post.countDocuments({
                    userId,
                    status: 'scheduled'
                });
                if (scheduledPostsCount >= 3) {
                    throw AppError.forbidden(
                        ErrorCodes.AUTH_003,
                        "Gói Free chỉ cho phép tối đa 3 bài đang chờ hẹn giờ. Vui lòng nâng cấp lên PRO."
                    );
                }
            }
        }

        let post = await Post.create({
            userId,
            accountIds,
            content,
            mediaUrls,
            status,
            scheduledAt
        });

        if (status === "scheduled") {
            const job = await postQueue.add(
                `post-job-${post._id}`,
                { postId: post._id, userId },
                { delay }
            );

            post.bullJobId = job.id;
            await post.save();
        }
        return post;
    },

    getAll: async (filter = {}, page = 1, limit = 10) => {
        const skip = (page - 1) * limit;
        const posts = await Post.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return posts;
    },

    getById: async (userId, postId) => {
        const post = await Post.findOne({ _id: postId, userId }).populate("accountIds");
        if (!post) {
            throw AppError.notFound(ErrorCodes.POST_NOT_FOUND, "Bài đăng không tồn tại hoặc bạn không có quyền.");
        }
        return post;
    },

    update: async (userId, postId, updatePayload) => {
        const post = await Post.findOne({ _id: postId, userId });
        if (!post) {
            throw AppError.notFound(ErrorCodes.POST_NOT_FOUND, "Bài đăng không tồn tại.");
        }
        if (["published", "processing"].includes(post.status)) {
            throw AppError.badRequest(ErrorCodes.INVALID_OPERATION, "Không thể chỉnh sửa bài đăng đang xử lý hoặc đã phát.");
        }

        if (updatePayload.hasOwnProperty('scheduledAt')) {
            let delay = 0;
            if (updatePayload.scheduledAt) {
                delay = new Date(updatePayload.scheduledAt).getTime() - Date.now();
                if (delay < 0) {
                    delay = 0;
                }
            }

            if (post.status === 'draft') {
                const user = await User.findById(userId);
                if (user && user.plan === 'free') {
                    const scheduledPostsCount = await Post.countDocuments({
                        userId,
                        status: 'scheduled'
                    });
                    if (scheduledPostsCount >= 3) {
                        throw AppError.forbidden(
                            ErrorCodes.AUTH_003,
                            "Gói Free chỉ cho phép tối đa 3 bài đang chờ hẹn giờ. Vui lòng nâng cấp lên PRO."
                        );
                    }
                }
            }

            if (post.bullJobId) {
                const oldJob = await postQueue.getJob(post.bullJobId);
                if (oldJob) await oldJob.remove();
            }
            const newJob = await postQueue.add(
                `post-job-${post._id}`,
                { postId: post._id, userId },
                { delay }
            );

            post.bullJobId = newJob.id;
            post.status = "scheduled";
            post.scheduledAt = updatePayload.scheduledAt;
        }

        if (updatePayload.content) post.content = updatePayload.content;
        if (updatePayload.mediaUrls) post.mediaUrls = updatePayload.mediaUrls;
        if (updatePayload.accountIds) post.accountIds = updatePayload.accountIds;

        await post.save();
        return post;
    },

    delete: async (userId, postId) => {
        const post = await Post.findOne({ _id: postId, userId });
        if (!post) {
            throw AppError.notFound(ErrorCodes.POST_NOT_FOUND, "Bài đăng không tồn tại.");
        }

        if (post.bullJobId) {
            const job = await postQueue.getJob(post.bullJobId);
            if (job) await job.remove();
        }

        await Post.deleteOne({ _id: postId });
        return true;
    },

    executePublishJob: async (postId, userId) => {
        const post = await Post.findById(postId);
        if (!post || post.status !== "scheduled") return;

        post.status = "processing";
        await post.save();

        const accounts = await Account.find({
            _id: { $in: post.accountIds },
            userId,
            isActive: true
        }).select("+config");

        const finalLogs = [];
        let totalSuccess = 0;

        for (const account of accounts) {
            try {
                const driver = getDriver(account.platform);

                const decryptedConfig = CryptoUtil.decrypt(account.config);

                const res = await driver.publish(post.content, decryptedConfig, post.mediaUrls);

                totalSuccess++;
                finalLogs.push({
                    accountId: account._id,
                    platform: account.platform,
                    status: "success",
                    publishedUrl: res?.publishedUrl || null
                });
            } catch (err) {
                // Nếu một tài khoản lỗi (Sai token, bot bị kích khỏi kênh), các tài khoản khác vẫn chạy tiếp tục
                finalLogs.push({
                    accountId: account._id,
                    platform: account.platform,
                    status: "failed",
                    errorReason: err.message || "Đã xảy ra lỗi không xác định."
                });
            }
        }

        post.logs = finalLogs;
        post.status = totalSuccess === post.accountIds.length ? "published" : "failed";
        post.bullJobId = null;

        await post.save();
    }
};

export default PostService;
