import HttpStatus from "../errors/httpStatus.js";
import AccountService from "../services/account.service.js";
import AppError from "../errors/appError.js";

const AccountController = {
    connectAccount: async (req, res) => {
        try {
            const userId = req.user.id;
            const { platform, config } = req.body;

            const newAccount = await AccountService.connect(userId, platform, config);

            return res.status(HttpStatus.CREATED).json({
                message: "Social account connected successfully",
                data: newAccount
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

    getConnectedAccounts: async (req, res) => {
        try {
            const userId = req.user.id;
            const allowedFilters = ['platform', 'isActive'];
            const filter = { userId };

            allowedFilters.forEach(key => {
                if (req.query[key]) {
                    if (key === 'isActive') {
                        filter[key] = req.query[key] === 'true';
                    } else {
                        filter[key] = req.query[key];
                    }
                }
            });

            const accounts = await AccountService.getAccounts(filter);

            return res.status(HttpStatus.OK).json({
                message: "Connected accounts fetched successfully",
                data: accounts
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

    updateAccount: async (req, res) => {
        try {
            const userId = req.user.id;
            const accountId = req.params.accountId;
            const { isActive, config } = req.body;

            const updatedAccount = await AccountService.update(userId, accountId, { isActive, config });

            return res.status(HttpStatus.OK).json({
                message: "Social account updated successfully",
                data: updatedAccount
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

    disconnectAccount: async (req, res) => {
        try {
            const userId = req.user.id;
            const accountId = req.params.accountId;

            await AccountService.delete(userId, accountId);

            return res.status(HttpStatus.OK).json({
                message: "Social account disconnected successfully"
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
    }
};

export default AccountController;
