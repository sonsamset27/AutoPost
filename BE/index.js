import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/configs/db.js";
import UserRoute from "./src/routes/user.route.js";
import AuthRoute from "./src/routes/auth.route.js";
import AccountRoute from "./src/routes/account.route.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";
dotenv.config();

const app = express();

const PORT = process.env.PORT;

connectDB();
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/api/v1/auth", AuthRoute);
app.use("/api/v1/users", UserRoute);
app.use("/api/v1/accounts", AccountRoute);
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