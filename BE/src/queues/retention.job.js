import cron from "node-cron";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { postQueue } from "./post.queue.js";

const setupRetentionJob = () => {
    // Chạy lúc 2:00 sáng mỗi ngày
    cron.schedule("0 2 * * *", async () => {
        console.log("🧹 [Retention Job] Bắt đầu dọn dẹp lịch sử bài đăng cũ...");
        try {
            // Ngày giới hạn: 7 ngày trước
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 7);

            // Tìm tất cả các user gói free
            const freeUsers = await User.find({ plan: 'free' }).select('_id');
            const freeUserIds = freeUsers.map(u => u._id);

            // Tìm bài viết của các user này tạo trước cutoffDate
            const oldPosts = await Post.find({
                userId: { $in: freeUserIds },
                createdAt: { $lt: cutoffDate }
            });

            if (oldPosts.length === 0) {
                console.log("🧹 [Retention Job] Không có bài viết nào cần xóa.");
                return;
            }

            let deletedCount = 0;
            for (const post of oldPosts) {
                // Hủy job BullMQ nếu lỡ bài này vẫn đang scheduled xa
                if (post.bullJobId) {
                    const job = await postQueue.getJob(post.bullJobId);
                    if (job) await job.remove();
                }
                
                await Post.deleteOne({ _id: post._id });
                deletedCount++;
            }

            console.log(`🧹 [Retention Job] Đã xóa thành công ${deletedCount} bài đăng cũ của User gói Free.`);
        } catch (error) {
            console.error("❌ [Retention Job] Lỗi khi dọn dẹp:", error);
        }
    });
};

export default setupRetentionJob;
