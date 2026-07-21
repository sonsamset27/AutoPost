import AppError from "../errors/appError.js";
import ErrorCodes from "../errors/errorCodes.js";

const requireString = (value, field) => {
    if (
        value === undefined ||
        value === null ||
        typeof value !== "string" ||
        !value.trim()
    ) {
        throw AppError.badRequest(
            ErrorCodes.SYS_002,
            `${field} is required`
        );
    }
};

const PlatformValidator = {
    telegram(config) {
        if (!config || typeof config !== "object" || Array.isArray(config)) {
            throw AppError.badRequest(
                ErrorCodes.SYS_002,
                "Telegram config is required"
            );
        }

        requireString(config.botToken, "Telegram Bot Token");
        requireString(config.chatId?.toString(), "Telegram Chat ID");
    },

    discord(config) {
        if (!config || typeof config !== "object" || Array.isArray(config)) {
            throw AppError.badRequest(
                ErrorCodes.SYS_002,
                "Discord config is required"
            );
        }

        requireString(config.webhookUrl, "Discord Webhook URL");
    },
};

export default PlatformValidator;