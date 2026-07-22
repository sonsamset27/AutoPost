import 'dotenv/config';
import express from "express";
import cors from "cors";
import connectDB from "./src/configs/db.js";
import UserRoute from "./src/routes/user.route.js";
import AuthRoute from "./src/routes/auth.route.js";
import AccountRoute from "./src/routes/account.route.js";
import PostRoute from "./src/routes/post.route.js";
import AdminRoute from "./src/routes/admin.route.js";
import TransactionRoute from "./src/routes/transaction.route.js";
import MediaRoute from "./src/routes/media.route.js";
import "./src/queues/post.queue.js"; // Khởi động BullMQ Worker
import setupRetentionJob from "./src/queues/retention.job.js"; // Cron Job
import { globalRateLimiter } from "./src/middlewares/rateLimit.middleware.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";

const app = express();

const PORT = process.env.PORT || 3027;

connectDB();
setupRetentionJob(); // Khởi động cron job dọn rác 7 ngày

app.use(cors({
    origin: 'http://localhost:5174',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Áp dụng Rate Limiting toàn cầu
app.use(globalRateLimiter);

app.use("/api/v1/auth", AuthRoute);
app.use("/api/v1/users", UserRoute);
app.use("/api/v1/accounts", AccountRoute);
app.use("/api/v1/posts", PostRoute);
app.use("/api/v1/admin", AdminRoute);
app.use("/api/v1/transactions", TransactionRoute);
app.use("/api/v1/media", MediaRoute);
app.get("/", (req, res) => {
    res.send("Backend is running!!!");
});
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    if (statusCode === 500) {
        console.error(`[Lỗi Hệ Thống] ${err.message}`, err);
    } else {
        console.warn(`[API Error] ${req.method} ${req.url} - ${statusCode} - ${err.message}`);
    }

    return res.status(statusCode).json({
        success: false,
        errorCode: err.errorCode || "SYS_001",
        message: err.message || "Internal server error"
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});