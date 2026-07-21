import { Router } from "express";
import MediaController from "../controllers/media.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import AppError from "../errors/appError.js";
import ErrorCodes from "../errors/errorCodes.js";

const MediaRoute = Router();

// Middleware chặn gói Free upload ảnh
const checkPlanUploadLimit = (req, res, next) => {
    try {
        if (req.user.plan === 'free') {
            throw AppError.forbidden(
                ErrorCodes.AUTH_003,
                "Gói Free không hỗ trợ đính kèm ảnh/video. Vui lòng nâng cấp lên PRO."
            );
        }
        next();
    } catch (err) {
        next(err);
    }
};

MediaRoute.post(
    "/upload", 
    authMiddleware.Authentication, 
    checkPlanUploadLimit,
    upload.array("media", 5), // Tối đa 5 file cho gói PRO
    MediaController.uploadMedia
);

export default MediaRoute;
