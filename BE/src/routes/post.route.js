import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import PostController from "../controllers/post.controller.js";
import PostValidator from "../validators/post.validator.js";

const PostRoute = Router();

PostRoute.get("/", authMiddleware.Authentication, PostValidator.getPosts, PostController.getPosts);
PostRoute.post("/", authMiddleware.Authentication, PostValidator.createPost, PostController.createPost);
PostRoute.get("/:id", authMiddleware.Authentication, PostValidator.validatePostId, PostController.getPostById);
PostRoute.put("/:id", authMiddleware.Authentication, PostValidator.validatePostId, PostValidator.updatePost, PostController.updatePost);
PostRoute.delete("/:id", authMiddleware.Authentication, PostValidator.validatePostId, PostController.deletePost);

export default PostRoute;