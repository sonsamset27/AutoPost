// ⚠️ dotenv phải được load TRƯỚC tất cả mọi thứ vì ES module hoist static imports
// Giải pháp: dùng --env-file flag hoặc load dotenv trong từng config file riêng
import 'dotenv/config';
import express from "express";
import connectDB from "./src/configs/db.js";
import UserRoute from "./src/routes/user.route.js";
import AuthRoute from "./src/routes/auth.route.js";
import AccountRoute from "./src/routes/account.route.js";
import PostRoute from "./src/routes/post.route.js";
import AdminRoute from "./src/routes/admin.route.js";
import TransactionRoute from "./src/routes/transaction.route.js";
import "./src/queues/post.queue.js"; // Khởi động BullMQ Worker
import cookieParser from "cookie-parser";
import morgan from "morgan";

const app = express();

const PORT = process.env.PORT;

connectDB();
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/api/v1/auth", AuthRoute);
app.use("/api/v1/users", UserRoute);
app.use("/api/v1/accounts", AccountRoute);
app.use("/api/v1/posts", PostRoute);
app.use("/api/v1/admin", AdminRoute);
app.use("/api/v1/transactions", TransactionRoute);
app.get("/", (req, res) => {
    res.send("Backend is running!!!");
});
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
        success: false,
        errorCode: err.errorCode || "SYS_001",
        message: err.message || "Internal server error"
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});