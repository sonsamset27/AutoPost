import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../configs/cloudinary.js";
import AppError from "../errors/appError.js";
import ErrorCodes from "../errors/errorCodes.js";

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "autopost_media",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "mp4", "mov"],
        resource_type: "auto"
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB 
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/image\/(jpeg|jpg|png|gif)|video\/(mp4|quicktime)/)) {
            cb(AppError.badRequest(ErrorCodes.INVALID_INPUT, "File format not supported! Only JPG, PNG, GIF, MP4, MOV are allowed."), false);
            return;
        }
        cb(null, true);
    }
});

export default upload;
