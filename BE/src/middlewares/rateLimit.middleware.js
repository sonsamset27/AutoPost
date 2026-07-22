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

export const getLimiter15m = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Bạn đã vượt quá giới hạn 100 lượt truy cập (GET) trong 15 phút. Vui lòng thử lại sau.",
    handler,
    standardHeaders: true,
    legacyHeaders: false,
});

export const getLimiter1m = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 60,
    message: "Bạn đã vượt quá giới hạn 60 lượt truy cập (GET) trong 1 phút. Vui lòng thử lại sau.",
    handler,
    standardHeaders: true,
    legacyHeaders: false,
});

export const writeLimiter15m = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: "Bạn đã vượt quá giới hạn 50 thao tác ghi (POST/PUT/DELETE) trong 15 phút. Vui lòng thử lại sau.",
    handler,
    standardHeaders: true,
    legacyHeaders: false,
});

export const globalRateLimiter = (req, res, next) => {
    if (req.method === 'GET') {
        getLimiter1m(req, res, (err) => {
            if (err) return next(err);
            getLimiter15m(req, res, next);
        });
    } else {
        writeLimiter15m(req, res, next);
    }
};
