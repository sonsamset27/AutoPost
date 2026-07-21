import User from "../models/user.model.js";
import AppError from "../errors/appError.js";
import ErrorCodes from "../errors/errorCodes.js";
import dotenv from "dotenv";
dotenv.config();
const UserService = {
    getUserById: async (userId) => {
        const user = await User.findById(userId);
        if (!user) {
            throw AppError.notFound(ErrorCodes.USER_001, "User not found");
        }
        return user;
    },
    getAll: async (filter = {}, page = 1, limit = 10) => {
        const skip = (page - 1) * limit;
        const users = await User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select({ password: 0 });
        if (users.length === 0) {
            throw AppError.notFound(ErrorCodes.USER_001, "Users not found");
        }
        return users;
    }
}
export default UserService;