import { Queue, Worker } from "bullmq";
import redisConnection from "../configs/redis.js";
import PostService from "../services/post.service.js";

export const postQueue = new Queue("PostQueue", {
    connection: redisConnection,
    defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false
    }
});

const postWorker = new Worker("PostQueue", async (job) => {
    const { postId, userId } = job.data;
    await PostService.executePublishJob(postId, userId);
}, {
    connection: redisConnection
});

postWorker.on("ready", () => {
    console.log("🤖 [BullMQ] Worker is ready and listening for scheduled posts...");
});

postWorker.on("failed", (job, err) => {
    console.error(`❌ [BullMQ] Job ${job.id} failed:`, err.message);
});
