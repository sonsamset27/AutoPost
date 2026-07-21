import mongoose from "mongoose";
import AppError from "../errors/appError.js";
import ErrorCodes from "../errors/errorCodes.js";
import getDriver from "../platformDrivers/registry.js";
import PlatformValidator from "./platform.validator.js";

const AccountValidator = {
    connectAccount(req, res, next) {
        try {
            const { platform, config } = req.body;
            if (!platform) {
                throw AppError.badRequest(
                    ErrorCodes.SYS_002,
                    "Platform is required"
                );
            }
            getDriver(platform);
            const validator = PlatformValidator[platform];
            if (!validator) {
                throw AppError.badRequest(
                    ErrorCodes.SYS_002,
                    "Platform is not supported"
                );
            }
            validator(config);
            next();
        } catch (err) {
            next(err);
        }
    },
    getConnectedAccounts(req, res, next) {
        try {
            const { platform, isActive } = req.query;
            if (platform) {
                getDriver(platform);
            }
            if (isActive !== undefined && !["true", "false"].includes(isActive)) {
                throw AppError.badRequest(
                    ErrorCodes.SYS_002,
                    "isActive must be true or false"
                );
            }
            next();
        } catch (err) {
            next(err);
        }
    },

    updateAccount(req, res, next) {
        try {
            const { isActive, config } = req.body;

            if (isActive === undefined && config === undefined) {
                throw AppError.badRequest(
                    ErrorCodes.SYS_002,
                    "Nothing to update"
                );
            }
            if (isActive !== undefined && typeof isActive !== "boolean") {
                throw AppError.badRequest(
                    ErrorCodes.SYS_002,
                    "isActive must be boolean"
                );
            }
            if (config !== undefined && (typeof config !== "object" || Array.isArray(config))) {
                throw AppError.badRequest(
                    ErrorCodes.SYS_002,
                    "Config must be an object"
                );
            }

            if (!mongoose.Types.ObjectId.isValid(req.params.accountId)) {
                throw AppError.badRequest(
                    ErrorCodes.SYS_002,
                    "Invalid account id"
                );
            }
            next();
        } catch (err) {
            next(err);
        }
    },
    disconnectAccount(req, res, next) {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.accountId)) {
                throw AppError.badRequest(
                    ErrorCodes.SYS_002,
                    "Invalid account id"
                );
            }
            next();
        } catch (err) {
            next(err);
        }
    },
};

export default AccountValidator;