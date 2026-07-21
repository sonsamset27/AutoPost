import axios from "axios";
import AppError from "../errors/appError.js";
import ErrorCodes from "../errors/errorCodes.js";

const TelegramDriver = {
    fetchAccountName: async (config) => {
        try {
            if (!config?.botToken || !config?.chatId) {
                throw new Error("Missing Telegram credentials");
            }

            const { data } = await axios.get(`https://api.telegram.org/bot${config.botToken}/getChat`, { params: { chat_id: config.chatId, }, timeout: 10000, });
            if (!data?.ok || !data?.result) {
                throw new Error("Telegram API returned an invalid response");
            }
            const chat = data.result;
            const accountName = chat.title || [chat.first_name, chat.last_name].filter(Boolean).join(" ") || chat.username || "Unknown Chat";
            return `Telegram: ${accountName}`;
        } catch (err) {
            console.error("Telegram Error:", {
                message: err.message,
                code: err.code,
                telegram: err.response?.data,
            });

            let friendlyMessage = "Thông tin cấu hình Telegram không chính xác.";
            if (!err.response) {
                switch (err.code) {
                    case "ECONNABORTED":
                        friendlyMessage = "Kết nối tới Telegram bị timeout. Vui lòng thử lại.";
                        break;
                    case "ENOTFOUND":
                    case "ECONNREFUSED":
                    case "EAI_AGAIN":
                        friendlyMessage = "Không thể kết nối tới máy chủ Telegram.";
                        break;
                    default:
                        friendlyMessage = err.message || "Không thể kết nối tới Telegram.";
                }
                throw AppError.badRequest(ErrorCodes.ACCOUNT_002, friendlyMessage);
            }
            const { error_code, description, } = err.response?.data || {};
            switch (error_code) {
                case 400:
                    if (description?.includes("chat not found")) {
                        friendlyMessage = "Không tìm thấy Chat. Vui lòng kiểm tra Chat ID hoặc đảm bảo Bot đã được thêm vào nhóm/kênh.";
                    } else {
                        friendlyMessage = description || "Yêu cầu tới Telegram không hợp lệ.";
                    }
                    break;

                case 401:
                    friendlyMessage = "Bot Token không hợp lệ hoặc đã bị thu hồi.";
                    break;

                case 403:
                    if (description?.includes("kicked")) {
                        friendlyMessage = "Bot đã bị xóa khỏi nhóm hoặc kênh.";
                    } else if (description?.includes("not a member")) {
                        friendlyMessage = "Bot chưa được thêm vào nhóm hoặc kênh.";
                    } else {
                        friendlyMessage = "Bot không có quyền truy cập vào Chat.";
                    }
                    break;

                case 404:
                    friendlyMessage = "Telegram API không tồn tại.";
                    break;

                case 429:
                    friendlyMessage = "Quá nhiều yêu cầu tới Telegram. Vui lòng thử lại sau.";
                    break;

                default:
                    friendlyMessage = description || "Đã xảy ra lỗi khi kết nối tới Telegram.";
            }

            throw AppError.badRequest(
                ErrorCodes.ACCOUNT_002,
                friendlyMessage
            );
        }
    },
    publish: async (content, config, mediaUrls = []) => {
        const baseUrl = `https://api.telegram.org/bot${config.botToken}`;
        const cleanMedia = (mediaUrls || []).filter(Boolean);

        try {
            // Trường hợp 1: Có nhiều ảnh (Đăng dạng Album nhóm ảnh)
            if (cleanMedia.length > 1) {
                const mediaPayload = cleanMedia.map((url, index) => ({
                    type: "photo",
                    media: url,
                    caption: index === 0 ? content : "", // Chỉ gắn nội dung vào bức ảnh đầu tiên để tránh lặp chữ
                    parse_mode: "Markdown"
                }));

                const { data } = await axios.post(`${baseUrl}/sendMediaGroup`, {
                    chat_id: config.chatId,
                    media: mediaPayload
                });
                return { publishedUrl: data.result?.[0]?.chat?.username ? `https://t.me/${data.result[0].chat.username}/${data.result[0].message_id}` : null };
            }

            // Trường hợp 2: Chỉ có đúng 1 ảnh
            if (cleanMedia.length === 1) {
                const { data } = await axios.post(`${baseUrl}/sendPhoto`, {
                    chat_id: config.chatId,
                    photo: cleanMedia[0],
                    caption: content,
                    parse_mode: "Markdown"
                });
                return { publishedUrl: data.result?.chat?.username ? `https://t.me/${data.result.chat.username}/${data.result.message_id}` : null };
            }

            // Trường hợp 3: Chỉ đăng bài viết dạng chữ (Text) thuần túy
            const { data } = await axios.post(`${baseUrl}/sendMessage`, {
                chat_id: config.chatId,
                text: content,
                parse_mode: "Markdown"
            });
            return { publishedUrl: data.result?.chat?.username ? `https://t.me/${data.result.chat.username}/${data.result.message_id}` : null };

        } catch (err) {
            // Quăng lỗi chuỗi thô để PostService gom logs, không quăng AppError làm chết luồng hàng đợi
            throw new Error(err.response?.data?.description || err.message || "Lỗi không xác định khi đăng bài lên Telegram");
        }
    }
};

export default TelegramDriver;