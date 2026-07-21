import HttpStatus from "../errors/httpStatus.js";
import UserService from "../services/user.service.js";
import AppError from "../errors/appError.js";
import ErrorCodes from "../errors/errorCodes.js";

const UserController = {
    getProfile: async (req, res) => {
        try {
            const user = await UserService.getUserById(req.user.id);
            return res.status(HttpStatus.OK).json({
                message: "User profile fetched successfully",
                data: user
            });
        } catch (error) {
            console.error("Error at getProfile:", error);
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    message: error.message,
                    errorCode: error.errorCode
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error",
                errorCode: ErrorCodes.SYS_001
            });
        }
    },
    getAll: async (req, res) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            const allowedFilters = ['role', 'plan', 'email'];
            const filter = {};

            allowedFilters.forEach(key => {
                if (req.query[key]) {
                    filter[key] = req.query[key];
                }
            });

            if (req.query.search) {
                filter.name = { $regex: req.query.search, $options: 'i' };
            }

            const users = await UserService.getAll(filter, page, limit);
            return res.status(HttpStatus.OK).json({
                message: "Users fetched successfully",
                data: users
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
                errorCode: ErrorCodes.SYS_001
            });
        }
    }
}
export default UserController;