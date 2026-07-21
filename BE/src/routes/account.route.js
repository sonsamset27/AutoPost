import { Router } from "express";
import AccountController from "../controllers/account.controller.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";
import AccountValidator from "../validators/account.validator.js";
const AccountRouter = Router();

AccountRouter.post("/connect", AuthMiddleware.Authentication, AccountValidator.connectAccount, AccountController.connectAccount);
AccountRouter.get("/", AuthMiddleware.Authentication, AccountValidator.getConnectedAccounts, AccountController.getConnectedAccounts);
AccountRouter.put("/:accountId", AuthMiddleware.Authentication, AccountValidator.updateAccount, AccountController.updateAccount);
AccountRouter.delete("/:accountId", AuthMiddleware.Authentication, AccountValidator.disconnectAccount, AccountController.disconnectAccount);

export default AccountRouter;
