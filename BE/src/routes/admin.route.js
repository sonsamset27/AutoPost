import { Router } from "express";
import AdminUserController from "../controllers/admin.user.controller.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";
import AdminValidator from "../validators/admin.validator.js";

const AdminRoute = Router();

// Apply Authentication and Authorization for all admin routes
AdminRoute.use(AuthMiddleware.Authentication);
AdminRoute.use(AuthMiddleware.Authorization('admin'));

// Admin User endpoints
AdminRoute.get("/users", AdminValidator.getAllUsers, AdminUserController.getAllUsers);
AdminRoute.get("/users/:id", AdminValidator.validateUserId, AdminUserController.getUserDetail);
AdminRoute.put("/users/:id/ban", AdminValidator.validateUserId, AdminValidator.banUser, AdminUserController.banUser);
AdminRoute.put("/users/:id/plan", AdminValidator.validateUserId, AdminValidator.upgradeUserPlan, AdminUserController.upgradeUserPlan);
AdminRoute.delete("/users/:id", AdminValidator.validateUserId, AdminUserController.deleteUser);

export default AdminRoute;
