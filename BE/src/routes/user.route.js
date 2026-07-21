import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";
import UserValidator from "../validators/user.validator.js";

const UserRoute = Router();

UserRoute.get("/profile", AuthMiddleware.Authentication, UserController.getProfile);
UserRoute.put("/change-password", AuthMiddleware.Authentication, UserValidator.changePassword, UserController.changePassword);

export default UserRoute;