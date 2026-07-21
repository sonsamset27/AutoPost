import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../errors/appError.js";
import ErrorCodes from "../errors/errorCodes.js";
import Token from "../models/token.model.js";
import dotenv from "dotenv";
dotenv.config();
const AuthService = {
    signUp: async (userData) => {
        const { name, email, password } = userData;
        const userExists = await User.findOne({ email });
        if (userExists) {
            throw AppError.conflict(ErrorCodes.USER_002, "Email already exists");
        }
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(password, salt);
        const user = await User.create({ name, email, password: passwordHash });
        return user;
    },
    signIn: async (email, password) => {
        const user = await User.findOne({ email });
        if (!user) {
            throw AppError.notFound(ErrorCodes.USER_001, "User not found");
        }
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            throw AppError.unauthorized(ErrorCodes.AUTH_001, "Invalid password");
        }
        const AccessToken = jwt.sign({ id: user._id, role: user.role, plan: user.plan }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        const RefreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
        await Token.create({ userId: user._id, token: RefreshToken });
        return { AccessToken, RefreshToken };
    },
    refreshToken: async (oldRefreshToken) => {
        const tokenExists = await Token.findOne({ token: oldRefreshToken });
        if (!tokenExists) {
            throw AppError.forbidden(ErrorCodes.AUTH_002, "Refresh token is invalid or logged out");
        }

        try {
            const decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);

            const user = await User.findById(decoded.id);
            if (!user) {
                throw AppError.notFound(ErrorCodes.USER_001, "User not found");
            }
            await Token.deleteOne({ token: oldRefreshToken });
            const newAccessToken = jwt.sign(
                { id: user._id, role: user.role, plan: user.plan },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "15m" }
            );

            const newRefreshToken = jwt.sign(
                { id: user._id },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: "7d" }
            );

            await Token.create({ userId: user._id, token: newRefreshToken });

            return { AccessToken: newAccessToken, RefreshToken: newRefreshToken };
        } catch (error) {
            throw AppError.forbidden(ErrorCodes.AUTH_002, "Refresh token is invalid or expired");
        }
    },
    logout: async (refreshTokenValue) => {
        if (refreshTokenValue) {
            await Token.deleteOne({ token: refreshTokenValue });
        }
        return true;
    },
}
export default AuthService
