import HttpStatus from "../errors/httpStatus.js";
import AuthService from "../services/auth.service.js";
import AppError from "../errors/appError.js";
const AuthController = {
    signUp: async (req, res) => {
        try {
            const { name, email, password } = req.body;
            const user = await AuthService.signUp({ name, email, password });
            return res.status(HttpStatus.CREATED).json({
                message: "User created successfully",
                data: user
            });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    message: error.message,
                    errorCode: error.errorCode
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error",
                errorCode: "SYS_001"
            });
        }
    },
    signIn: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const { AccessToken, RefreshToken } = await AuthService.signIn(email, password);

            res.cookie("accessToken", AccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 15 * 60 * 1000
            });

            res.cookie("refreshToken", RefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                path: "/api/v1/auth",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            return res.status(200).json({ success: true, message: "Sign in successful" });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    message: error.message,
                    errorCode: error.errorCode
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error",
                errorCode: "SYS_001"
            });
        }
    },

    refresh: async (req, res, next) => {
        try {
            const oldRefreshToken = req.cookies.refreshToken;
            const { AccessToken, RefreshToken } = await AuthService.refreshToken(oldRefreshToken);

            res.cookie("accessToken", AccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 15 * 60 * 1000
            });

            res.cookie("refreshToken", RefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                path: "/api/v1/auth",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            return res.status(200).json({ success: true, message: "Token refreshed" });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    message: error.message,
                    errorCode: error.errorCode
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error",
                errorCode: "SYS_001"
            });
        }
    },

    logout: async (req, res, next) => {
        try {
            const oldRefreshToken = req.cookies.refreshToken;
            await AuthService.logout(oldRefreshToken);

            res.clearCookie("accessToken");
            res.clearCookie("refreshToken", { path: "/api/v1/auth" });

            return res.status(200).json({ success: true, message: "Logged out successfully" });
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    message: error.message,
                    errorCode: error.errorCode
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error",
                errorCode: "SYS_001"
            });
        }
    }
}
export default AuthController;