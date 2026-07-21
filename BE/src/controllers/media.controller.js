import HttpStatus from "../errors/httpStatus.js";
import AppError from "../errors/appError.js";
import ErrorCodes from "../errors/errorCodes.js";

const MediaController = {
    uploadMedia: async (req, res) => {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    errorCode: ErrorCodes.INVALID_INPUT,
                    message: "No files uploaded"
                });
            }

            // user plan limit check (from middleware or here)
            // Lấy URLs từ file đã upload lên Cloudinary
            const urls = req.files.map(file => file.path);

            return res.status(HttpStatus.CREATED).json({
                message: "Files uploaded successfully",
                data: {
                    mediaUrls: urls
                }
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    errorCode: error.errorCode,
                    message: error.message
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                errorCode: ErrorCodes.SYS_001,
                message: "Internal server error"
            });
        }
    }
};

export default MediaController;
