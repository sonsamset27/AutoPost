import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisConnection = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null, // Bắt buộc cho BullMQ
    retryStrategy(times) {
        // Tăng thời gian giãn cách kết nối lại nếu bị ngắt liên tục (tối thiểu 2 giây)
        return Math.min(times * 100, 3000);
    },
    // Các cấu hình tối ưu hóa đường truyền mạng Cloud
    keepAlive: 30000,
    connectTimeout: 10000
});

let isFirstConnect = true;

redisConnection.on("connect", () => {
    if (isFirstConnect) {
        console.log("⚡ [Upstash Redis] Connected to Cloud Redis successfully!");
        isFirstConnect = false;
    }
});

// BẮT BUỘC: Bẫy lỗi và dập tắt hoàn toàn log ECONNRESET
redisConnection.on("error", (err) => {
    if (err.code === "ECONNRESET" || err.message?.includes("ECONNRESET")) {
        return; // Im lặng bỏ qua, cho phép thư viện tự kết nối lại ngầm
    }
    console.error("❌ [Upstash Redis] Connection error:", err.message);
});

export default redisConnection;
