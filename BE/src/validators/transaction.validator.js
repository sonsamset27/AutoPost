import AppError from "../errors/appError.js";
import ErrorCodes from "../errors/errorCodes.js";

const TransactionValidator = {
    // POST /transactions/webhook
    webhook(req, res, next) {
        try {
            const { orderCode, status } = req.body;

            if (!orderCode) {
                throw AppError.badRequest(
                    ErrorCodes.TXN_002,
                    "orderCode is required"
                );
            }

            if (typeof orderCode !== "string" && typeof orderCode !== "number") {
                throw AppError.badRequest(
                    ErrorCodes.TXN_002,
                    "orderCode must be a string or number"
                );
            }

            if (!status) {
                throw AppError.badRequest(
                    ErrorCodes.TXN_002,
                    "status is required"
                );
            }

            const validStatuses = ["PAID", "completed", "failed", "cancelled"];
            if (!validStatuses.includes(status)) {
                throw AppError.badRequest(
                    ErrorCodes.INVALID_INPUT,
                    `Invalid status. Must be one of: ${validStatuses.join(", ")}`
                );
            }

            next();
        } catch (err) {
            next(err);
        }
    }
};

export default TransactionValidator;
