import { Router } from "express";
import TransactionController from "../controllers/transaction.controller.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";
import TransactionValidator from "../validators/transaction.validator.js";

const TransactionRoute = Router();

TransactionRoute.post("/create-payment", AuthMiddleware.Authentication, TransactionController.createPayment);
TransactionRoute.post("/webhook", TransactionValidator.webhook, TransactionController.webhook);

export default TransactionRoute;
