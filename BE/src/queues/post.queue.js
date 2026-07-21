import { Queue, Worker } from "bullmq";
import redisConnection from "../configs/redis.js"; // Import kết nối tập trung từ bước 3
import PostService from "../services/post.service.js";

// 1. Khởi tạo Hàng đợi sử dụng chung kết nối Redis xịn
export const postQueue = new Queue("PostQueue", {
    connection: redisConnection, // Gắn vào đây
    defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false
    }
});

// 2. Khởi tạo Worker cũng dùng chung kết nối Redis đó
const postWorker = new Worker("PostQueue", async (job) => {
    const { postId, userId } = job.data;
    await PostService.executePublishJob(postId, userId);
}, {
    connection: redisConnection // Gắn vào đây
});

postWorker.on("ready", () => {
    console.log("🤖 [BullMQ] Worker is ready and listening for scheduled posts...");
});

postWorker.on("failed", (job, err) => {
    console.error(`❌ [BullMQ] Job ${job.id} failed:`, err.message);
});
