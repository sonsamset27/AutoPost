import TelegramDriver from "./telegram.driver.js";
import DiscordDriver from "./discord.driver.js";
import AppError from "../errors/appError.js";
import ErrorCodes from "../errors/errorCodes.js";

const PlatformRegistry = {
    telegram: TelegramDriver,
    discord: DiscordDriver,
};

const getDriver = (platform) => {
    const driver = PlatformRegistry[platform];

    if (!driver) {
        throw AppError.badRequest(
            ErrorCodes.ACCOUNT_004,
            `Platform '${platform}' is not supported`
        );
    }

    return driver;
};

export default getDriver;
