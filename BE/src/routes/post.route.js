import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import PostController from "../controllers/post.controller.js";

const PostRoute = Router();

PostRoute.get("/", authMiddleware.Authentication, PostController.getPosts);
PostRoute.post("/", authMiddleware.Authentication, PostController.createPost);
PostRoute.get("/:id", authMiddleware.Authentication, PostController.getPostById);
PostRoute.put("/:id", authMiddleware.Authentication, PostController.updatePost);
PostRoute.delete("/:id", authMiddleware.Authentication, PostController.deletePost);

export default PostRoute;