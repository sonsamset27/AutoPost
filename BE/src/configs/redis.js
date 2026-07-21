import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisConnection = new Redis(process.env.REDIS_URL, {
    // Bắt buộc phải có để BullMQ hoạt động ổn định
    maxRetriesPerRequest: null,

    // Tự động kết nối lại nếu mạng Internet bị chập chờn
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },

    // Giữ cho đường truyền luôn sống
    keepAlive: 10000
});

redisConnection.on("connect", () => {
    console.log("⚡ [Upstash Redis] Connected to Cloud Redis successfully!");
});

redisConnection.on("error", (err) => {
    console.error("❌ [Upstash Redis] Connection error:", err.message);
});

export default redisConnection;
