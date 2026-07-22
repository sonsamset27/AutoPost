import rateLimit from "express-rate-limit";
import HttpStatus from "../errors/httpStatus.js";
import ErrorCodes from "../errors/errorCodes.js";

const handler = (req, res, next, options) => {
    res.status(HttpStatus.TOO_MANY_REQUESTS).json({
        success: false,
        errorCode: ErrorCodes.SYS_003 || "RATE_LIMIT_EXCEEDED",
        message: options.message
    });
};

// GET: 100 requests per 15 minutes
export const getLimiter15m = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Bạn đã vượt quá giới hạn 100 lượt truy cập (GET) trong 15 phút. Vui lòng thử lại sau.",
    handler,
    standardHeaders: true,
    legacyHeaders: false,
});

// GET: 60 requests per 1 minute
export const getLimiter1m = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 60,
    message: "Bạn đã vượt quá giới hạn 60 lượt truy cập (GET) trong 1 phút. Vui lòng thử lại sau.",
    handler,
    standardHeaders: true,
    legacyHeaders: false,
});

// POST/PUT/DELETE: 20 requests per 15 minutes
export const writeLimiter15m = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Bạn đã vượt quá giới hạn 20 thao tác ghi (POST/PUT/DELETE) trong 15 phút. Vui lòng thử lại sau.",
    handler,
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware tổng hợp tự động chọn theo Method
export const globalRateLimiter = (req, res, next) => {
    if (req.method === 'GET') {
        // Áp dụng bộ lọc 1 phút trước, sau đó tới 15 phút
        getLimiter1m(req, res, (err) => {
            if (err) return next(err);
            getLimiter15m(req, res, next);
        });
    } else {
        // Áp dụng cho các method ghi (POST, PUT, DELETE, PATCH)
        writeLimiter15m(req, res, next);
    }
};
