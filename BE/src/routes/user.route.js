import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";
const UserRoute = Router();

UserRoute.get("/profile", AuthMiddleware.Authentication, UserController.getProfile);

export default UserRoute;