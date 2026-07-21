import HttpStatus from "../errors/httpStatus.js";
import TransactionService from "../services/transaction.service.js";
import AppError from "../errors/appError.js";
import ErrorCodes from "../errors/errorCodes.js";

const TransactionController = {
    createPayment: async (req, res) => {
        try {
            const userId = req.user.id;
            const data = await TransactionService.createPayment(userId);

            return res.status(HttpStatus.CREATED).json({
                message: "Payment link generated successfully",
                data
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
    },

    webhook: async (req, res) => {
        try {
            // Webhook payload from PayOS or our mock
            const webhookData = req.body;
            
            const result = await TransactionService.handleWebhook(webhookData);

            return res.status(HttpStatus.OK).json({
                message: "Webhook processed successfully",
                data: result
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
};

export default TransactionController;
