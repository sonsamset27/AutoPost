import AppError from "../errors/appError.js";
import ErrorCodes from "../errors/errorCodes.js";

export const validateEmail = (email) => {
    if (!email) {
        throw AppError.badRequest(ErrorCodes.VALIDATION_001, "Email is required");
    }

    const emailStr = email.trim();
    if (emailStr.length > 254) {
        throw AppError.badRequest(ErrorCodes.VALIDATION_001, "Email is too long");
    }

    // Regex chuẩn hỗ trợ hầu hết các định dạng email phổ thông
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(emailStr)) {
        throw AppError.badRequest(ErrorCodes.VALIDATION_001, "Invalid email format");
    }

    return emailStr.toLowerCase();
};