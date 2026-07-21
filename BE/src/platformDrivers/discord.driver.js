import axios from "axios";
import AppError from "../errors/appError.js";
import ErrorCodes from "../errors/errorCodes.js";

const DiscordDriver = {
    fetchAccountName: async (config) => {
        try {
            if (!config?.webhookUrl) {
                throw new Error("Missing webhook URL");
            }
            if (!config.webhookUrl.startsWith("https://discord.com") &&
                !config.webhookUrl.startsWith("https://discord.com") &&
                !config.webhookUrl.startsWith("https://discord.com")) {
                throw AppError.badRequest(
                    ErrorCodes.ACCOUNT_003,
                    "Định dạng Discord Webhook URL không hợp lệ."
                );
            }
            const { data } = await axios.get(config.webhookUrl, { timeout: 10000, });
            const accountName = data.name || data.channel?.name || "Unknown Webhook";
            return `Discord: ${accountName}`;
        } catch (err) {
            console.error("Discord Error:", {
                message: err.message,
                code: err.code,
                discord: err.response?.data,
            });
            let friendlyMessage = "Thông tin Webhook Discord không hợp lệ.";
            if (axios.isAxiosError(err)) {
                if (!err.response) {
                    switch (err.code) {
                        case "ECONNABORTED":
                            friendlyMessage = "Kết nối tới Discord bị timeout.";
                            break;

                        case "ENOTFOUND":
                        case "ECONNREFUSED":
                        case "EAI_AGAIN":
                            friendlyMessage = "Không thể kết nối tới Discord.";
                            break;

                        default:
                            friendlyMessage = "Lỗi kết nối tới Discord.";
                    }
                } else {
                    switch (err.response.status) {
                        case 401:
                            friendlyMessage = "Webhook Discord không hợp lệ.";
                            break;
                        case 404:
                            friendlyMessage = "Không tìm thấy Discord Webhook.";
                            break;
                        case 429:
                            friendlyMessage = "Discord đang giới hạn số lượng yêu cầu. Vui lòng thử lại sau.";
                            break;
                        default:
                            friendlyMessage = err.response.data?.message || "Đã xảy ra lỗi từ Discord.";
                    }
                }
            }
            throw AppError.badRequest(
                ErrorCodes.ACCOUNT_003,
                friendlyMessage
            );
        }
    },
    publish: async (content, config, mediaUrls = []) => {
        const cleanMedia = (mediaUrls || []).filter(Boolean);

        try {
            const payload = { content };

            // Nếu có ảnh truyền lên, biến đổi chúng thành khối Embed để Discord hiển thị mượt mà
            if (cleanMedia.length > 0) {
                payload.embeds = cleanMedia.map(url => ({
                    image: { url }
                }));
            }

            // Gọi Webhook đẩy bài lên Discord
            await axios.post(config.webhookUrl, payload);

            return { success: true };
        } catch (err) {
            throw new Error(err.response?.data?.message || err.message || "Lỗi không thể kết nối tới Discord Webhook");
        }
    }
};

export default DiscordDriver;