import mongoose from "mongoose";
import AppError from "../errors/appError.js";
import ErrorCodes from "../errors/errorCodes.js";

const PostValidator = {
    // POST /posts - Tạo bài viết mới
    createPost(req, res, next) {
        try {
            const { content, accountIds, scheduledAt, mediaUrls } = req.body;

            // content bắt buộc
            if (!content || typeof content !== "string" || !content.trim()) {
                throw AppError.badRequest(
                    ErrorCodes.INVALID_INPUT,
                    "Content is required and must be a non-empty string"
                );
            }

            // accountIds bắt buộc, phải là mảng không rỗng
            if (!accountIds || !Array.isArray(accountIds) || accountIds.length === 0) {
                throw AppError.badRequest(
                    ErrorCodes.INVALID_INPUT,
                    "accountIds must be a non-empty array"
                );
            }

            // Kiểm tra từng accountId là ObjectId hợp lệ
            for (const id of accountIds) {
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    throw AppError.badRequest(
                        ErrorCodes.INVALID_INPUT,
                        `Invalid accountId: ${id}`
                    );
                }
            }

            // scheduledAt nếu có phải là Date hợp lệ và ở tương lai
            if (scheduledAt !== undefined) {
                const d = new Date(scheduledAt);
                if (isNaN(d.getTime())) {
                    throw AppError.badRequest(
                        ErrorCodes.INVALID_INPUT,
                        "scheduledAt must be a valid date"
                    );
                }
                if (d.getTime() <= Date.now()) {
                    throw AppError.badRequest(
                        ErrorCodes.INVALID_INPUT,
                        "scheduledAt must be in the future"
                    );
                }
            }

            // mediaUrls nếu có phải là mảng chứa chuỗi
            if (mediaUrls !== undefined) {
                if (!Array.isArray(mediaUrls)) {
                    throw AppError.badRequest(
                        ErrorCodes.INVALID_INPUT,
                        "mediaUrls must be an array"
                    );
                }
                for (const url of mediaUrls) {
                    if (typeof url !== "string" || !url.trim()) {
                        throw AppError.badRequest(
                            ErrorCodes.INVALID_INPUT,
                            "Each mediaUrl must be a non-empty string"
                        );
                    }
                }
            }

            // Trim content
            req.body.content = content.trim();
            next();
        } catch (err) {
            next(err);
        }
    },

    // GET /posts - Lấy danh sách bài đăng
    getPosts(req, res, next) {
        try {
            const { status, page, limit } = req.query;

            // status nếu có phải thuộc enum hợp lệ
            const validStatuses = ["draft", "scheduled", "processing", "published", "failed"];
            if (status && !validStatuses.includes(status)) {
                throw AppError.badRequest(
                    ErrorCodes.INVALID_INPUT,
                    `Invalid status. Must be one of: ${validStatuses.join(", ")}`
                );
            }

            // page & limit phải là số dương
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
    },

    // GET/PUT/DELETE /posts/:id - Validate ObjectId trong params
    validatePostId(req, res, next) {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                throw AppError.badRequest(
                    ErrorCodes.INVALID_INPUT,
                    "Invalid post ID"
                );
            }
            next();
        } catch (err) {
            next(err);
        }
    },

    // PUT /posts/:id - Cập nhật bài viết
    updatePost(req, res, next) {
        try {
            const { content, scheduledAt, mediaUrls, accountIds } = req.body;

            // Phải có ít nhất 1 trường để cập nhật
            if (content === undefined && scheduledAt === undefined && mediaUrls === undefined && accountIds === undefined) {
                throw AppError.badRequest(
                    ErrorCodes.INVALID_INPUT,
                    "Nothing to update. Provide at least one field: content, scheduledAt, mediaUrls, or accountIds"
                );
            }

            // Validate content nếu có
            if (content !== undefined) {
                if (typeof content !== "string" || !content.trim()) {
                    throw AppError.badRequest(
                        ErrorCodes.INVALID_INPUT,
                        "Content must be a non-empty string"
                    );
                }
                req.body.content = content.trim();
            }

            // Validate scheduledAt nếu có
            if (scheduledAt !== undefined) {
                const d = new Date(scheduledAt);
                if (isNaN(d.getTime())) {
                    throw AppError.badRequest(
                        ErrorCodes.INVALID_INPUT,
                        "scheduledAt must be a valid date"
                    );
                }
                if (d.getTime() <= Date.now()) {
                    throw AppError.badRequest(
                        ErrorCodes.INVALID_INPUT,
                        "scheduledAt must be in the future"
                    );
                }
            }

            // Validate mediaUrls nếu có
            if (mediaUrls !== undefined) {
                if (!Array.isArray(mediaUrls)) {
                    throw AppError.badRequest(
                        ErrorCodes.INVALID_INPUT,
                        "mediaUrls must be an array"
                    );
                }
                for (const url of mediaUrls) {
                    if (typeof url !== "string" || !url.trim()) {
                        throw AppError.badRequest(
                            ErrorCodes.INVALID_INPUT,
                            "Each mediaUrl must be a non-empty string"
                        );
                    }
                }
            }

            // Validate accountIds nếu có
            if (accountIds !== undefined) {
                if (!Array.isArray(accountIds) || accountIds.length === 0) {
                    throw AppError.badRequest(
                        ErrorCodes.INVALID_INPUT,
                        "accountIds must be a non-empty array"
                    );
                }
                for (const id of accountIds) {
                    if (!mongoose.Types.ObjectId.isValid(id)) {
                        throw AppError.badRequest(
                            ErrorCodes.INVALID_INPUT,
                            `Invalid accountId: ${id}`
                        );
                    }
                }
            }

            next();
        } catch (err) {
            next(err);
        }
    }
};

export default PostValidator;
