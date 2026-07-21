import mongoose from "mongoose";
import AppError from "../errors/appError.js";
import ErrorCodes from "../errors/errorCodes.js";

const AdminValidator = {
    // Validate :id param cho tất cả admin routes có userId
    validateUserId(req, res, next) {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                throw AppError.badRequest(
                    ErrorCodes.INVALID_INPUT,
                    "Invalid user ID"
                );
            }
            next();
        } catch (err) {
            next(err);
        }
    },

    // PUT /admin/users/:id/ban
    banUser(req, res, next) {
        try {
            const { isBanned } = req.body;

            if (isBanned === undefined) {
                throw AppError.badRequest(
                    ErrorCodes.INVALID_INPUT,
                    "isBanned is required"
                );
            }

            if (typeof isBanned !== "boolean") {
                throw AppError.badRequest(
                    ErrorCodes.INVALID_INPUT,
                    "isBanned must be a boolean (true or false)"
                );
            }

            next();
        } catch (err) {
            next(err);
        }
    },

    // PUT /admin/users/:id/plan
    upgradeUserPlan(req, res, next) {
        try {
            const { plan, durationDays } = req.body;

            if (!plan) {
                throw AppError.badRequest(
                    ErrorCodes.INVALID_INPUT,
                    "plan is required"
                );
            }

            if (plan !== "pro") {
                throw AppError.badRequest(
                    ErrorCodes.INVALID_INPUT,
                    "plan must be 'pro'"
                );
            }

            if (durationDays !== undefined) {
                if (typeof durationDays !== "number" || durationDays < 1 || durationDays > 365) {
                    throw AppError.badRequest(
                        ErrorCodes.INVALID_INPUT,
                        "durationDays must be a number between 1 and 365"
                    );
                }
            }

            next();
        } catch (err) {
            next(err);
        }
    },

    // GET /admin/users - Validate query params
    getAllUsers(req, res, next) {
        try {
            const { plan, page, limit } = req.query;

            if (plan && !["free", "pro"].includes(plan)) {
                throw AppError.badRequest(
                    ErrorCodes.INVALID_INPUT,
                    "plan must be 'free' or 'pro'"
                );
            }

            if (page !== undefined && (isNaN(Number(page)) || Number(page) < 1)) {
                throw AppError.badRequest(
                    ErrorCodes.INVALID_INPUT,
                    "Page must be a positive number"
                );
            }

            if (limit !== undefined && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
                throw AppError.badRequest(
                    ErrorCodes.INVALID_INPUT,
                    "Limit must be a number between 1 and 100"
                );
            }

            next();
        } catch (err) {
            next(err);
        }
    }
};

export default AdminValidator;
