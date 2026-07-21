import AppError from "../errors/appError.js";
import ErrorCodes from "../errors/errorCodes.js";

const UserValidator = {
    // PUT /users/change-password
    changePassword(req, res, next) {
        try {
            const { oldPassword, newPassword } = req.body;

            if (!oldPassword || !newPassword) {
                throw AppError.badRequest(
                    ErrorCodes.INVALID_INPUT,
                    "oldPassword and newPassword are required"
                );
            }

            if (typeof oldPassword !== "string" || typeof newPassword !== "string") {
                throw AppError.badRequest(
                    ErrorCodes.INVALID_INPUT,
                    "Passwords must be strings"
                );
            }

            if (newPassword.length < 6) {
                throw AppError.badRequest(
                    ErrorCodes.INVALID_INPUT,
                    "New password must be at least 6 characters"
                );
            }

            if (oldPassword === newPassword) {
                throw AppError.badRequest(
                    ErrorCodes.INVALID_INPUT,
                    "New password must be different from old password"
                );
            }

            next();
        } catch (err) {
            next(err);
        }
    }
};

export default UserValidator;
