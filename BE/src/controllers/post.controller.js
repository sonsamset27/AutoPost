import HttpStatus from "../errors/httpStatus.js";
import PostService from "../services/post.service.js";
import AppError from "../errors/appError.js";

const PostController = {
    // 1. POST: Tạo mới bài viết hoặc lên lịch hẹn giờ đăng
    createPost: async (req, res) => {
        try {
            const userId = req.user.id; // Lấy từ middleware xác thực (Auth)

            // req.body bao gồm: { accountIds: [], content, mediaUrls: [], scheduledAt }
            const newPost = await PostService.create(userId, req.body);

            return res.status(HttpStatus.CREATED || 201).json({
                message: "Post created and scheduled successfully",
                data: newPost
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
                errorCode: "SYS_001"
            });
        }
    },

    // 2. GET: Lấy danh sách bài đăng có bộ lọc & phân trang của riêng User đó
    getPosts: async (req, res) => {
        try {
            const userId = req.user.id;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            // Thiết lập bộ lọc mặc định là của riêng User đang đăng nhập
            const filter = { userId };

            // Client có thể lọc theo trạng thái, nội dung, ngày tạo
            if (req.query.status && req.query.status !== 'all') {
                filter.status = req.query.status;
            }
            if (req.query.search) {
                filter.content = { $regex: req.query.search, $options: 'i' };
            }
            if (req.query.startDate && req.query.endDate) {
                filter.createdAt = {
                    $gte: new Date(req.query.startDate),
                    $lte: new Date(req.query.endDate)
                };
            }

            const posts = await PostService.getAll(filter, page, limit);

            return res.status(HttpStatus.OK).json({
                message: "Posts fetched successfully",
                data: posts
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
                errorCode: "SYS_001"
            });
        }
    },

    // 3. GET /:id: Lấy chi tiết bài viết và danh sách lịch sử logs đi kèm
    getPostById: async (req, res) => {
        try {
            const userId = req.user.id;
            const postId = req.params.id;

            const post = await PostService.getById(userId, postId);

            return res.status(HttpStatus.OK).json({
                message: "Post details fetched successfully",
                data: post
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
                errorCode: "SYS_001"
            });
        }
    },

    // 4. PUT /:id: Chỉnh sửa nội dung hoặc cập nhật lại lịch hẹn giờ đăng bài
    updatePost: async (req, res) => {
        try {
            const userId = req.user.id;
            const postId = req.params.id;

            // req.body có thể chứa: { content, mediaUrls, scheduledAt, accountIds }
            const updatedPost = await PostService.update(userId, postId, req.body);

            return res.status(HttpStatus.OK).json({
                message: "Post updated successfully",
                data: updatedPost
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
                errorCode: "SYS_001"
            });
        }
    },

    // 5. DELETE /:id: Xóa bài viết và tự động hủy Job tương ứng trong BullMQ
    deletePost: async (req, res) => {
        try {
            const userId = req.user.id;
            const postId = req.params.id;

            await PostService.delete(userId, postId);

            return res.status(HttpStatus.OK).json({
                message: "Post and its scheduled job deleted successfully"
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
                errorCode: "SYS_001"
            });
        }
    }
};

export default PostController;
