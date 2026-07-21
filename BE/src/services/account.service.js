import Account from "../models/account.model.js";
import AppError from "../errors/appError.js";
import ErrorCodes from "../errors/errorCodes.js";
import getDriver from "../platformDrivers/registry.js";
import CryptoUtil from "../utils/crypto.util.js";

const AccountService = {
    connect: async (userId, platform, config) => {
        if (!platform) {
            throw AppError.badRequest(ErrorCodes.INVALID_INPUT, "Platform is required");
        }
        const driver = getDriver(platform);
        const platformAccountName = await driver.fetchAccountName(config);

        const existingAccount = await Account.findOne({ userId, platform, platformAccountName });
        if (existingAccount) {
            throw AppError.conflict(ErrorCodes.ACCOUNT_001, "This social account has already been connected");
        }

        return Account.create({
            userId,
            platform,
            platformAccountName,
            config: CryptoUtil.encrypt(config)
        });
    },

    getAccounts: async (filter = {}) => {
        const accounts = await Account.find(filter).sort({ createdAt: -1 }).select("-config");
        if (accounts.length === 0) {
            throw AppError.notFound(ErrorCodes.ACCOUNT_002, "No connected accounts found");
        }
        return accounts;
    },

    update: async (userId, accountId, updatePayload) => {
        const updateData = {};

        if (typeof updatePayload.isActive === 'boolean') {
            updateData.isActive = updatePayload.isActive;
        }

        if (updatePayload.config && Object.keys(updatePayload.config).length > 0) {
            const currentAccount = await Account.findOne({ _id: accountId, userId });
            if (!currentAccount) {
                throw AppError.notFound(ErrorCodes.ACCOUNT_002, "Account not found or access denied");
            }

            const driver = getDriver(currentAccount.platform);
            const platformAccountName = await driver.fetchAccountName(updatePayload.config);
            const duplicated = await Account.findOne({
                userId,
                platform: currentAccount.platform,
                platformAccountName,
                _id: { $ne: accountId }
            });

            if (duplicated) {
                throw AppError.conflict(ErrorCodes.ACCOUNT_001, "This social account has already been connected");
            }
            updateData.platformAccountName = platformAccountName;
            updateData.config = CryptoUtil.encrypt(updatePayload.config);
        }

        const updatedAccount = await Account.findOneAndUpdate(
            { _id: accountId, userId },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedAccount) {
            throw AppError.notFound(ErrorCodes.ACCOUNT_002, "Account not found or access denied");
        }

        return updatedAccount;
    },

    delete: async (userId, accountId) => {
        const deletedAccount = await Account.findOneAndDelete({ _id: accountId, userId });
        if (!deletedAccount) {
            throw AppError.notFound(ErrorCodes.ACCOUNT_002, "Account not found or access denied");
        }
        return true;
    }
};

export default AccountService;
