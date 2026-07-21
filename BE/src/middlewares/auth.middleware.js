import HttpStatus from "../errors/httpStatus.js";
import AppError from "../errors/appError.js";
import ErrorCodes from "../errors/errorCodes.js";
import jwt from "jsonwebtoken";
import UserService from "../services/user.service.js";
import dotenv from "dotenv";
dotenv.config();
const AuthMiddleware = {
    Authentication: async (req, res, next) => {
        try {
            const token = req.cookies?.accessToken;

            if (!token) {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    errorCode: ErrorCodes.AUTH_001,
                    message: "Access token is missing",
                });
            }

            const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            const user = await UserService.getUserById(payload.id);

            if (!user) {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    errorCode: ErrorCodes.USER_001,
                    message: "User not found",
                });
            }

            req.user = user;
            next();

        } catch (error) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                errorCode: ErrorCodes.AUTH_004,
                message: "Authentication failed",
            });
        }
    },
    Authorization: (...roles) => {
        return (req, res, next) => {
            if (!roles.includes(req.user.role)) {
                return res.status(HttpStatus.FORBIDDEN).json({
                    errorCode: ErrorCodes.AUTH_003,
                    message: "You do not have permission to access this resource",
                });
            }
            next();
        };
    }
}
export default AuthMiddleware;