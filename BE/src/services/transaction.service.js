import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";
import AppError from "../errors/appError.js";
import ErrorCodes from "../errors/errorCodes.js";
import dotenv from "dotenv";

dotenv.config();

const TransactionService = {
    createPayment: async (userId) => {
        const user = await User.findById(userId);
        if (!user) {
            throw AppError.notFound(ErrorCodes.USER_001, "User not found");
        }

        const amount = Number(process.env.PRO_PLAN_PRICE) || 100000;
        const orderCode = Date.now().toString();

        const transaction = await Transaction.create({
            userId,
            amount,
            orderCode,
            status: 'pending'
        });

        // MOCK PAYOS API RESPONSE for now since real credentials are not available
        const checkoutUrl = `https://payos.vn/mock-checkout/${orderCode}`;

        return {
            transaction,
            checkoutUrl,
            message: "This is a mock checkout URL. To simulate successful payment, send a POST request to /api/v1/transactions/webhook with this orderCode."
        };
    },

    handleWebhook: async (webhookData) => {
        // In a real scenario with PayOS SDK:
        // const payos = require('@payos/node');
        // const isValid = payos.verifyPaymentWebhookData(webhookData);
        // if (!isValid) throw new Error("Invalid signature");

        // Mock Webhook handler
        const { orderCode, status } = webhookData;

        if (!orderCode) {
            throw AppError.badRequest(ErrorCodes.INVALID_INPUT, "Missing orderCode");
        }

        const transaction = await Transaction.findOne({ orderCode });
        if (!transaction) {
            throw AppError.notFound(ErrorCodes.SYS_002, "Transaction not found");
        }

        if (transaction.status === 'completed') {
            return { message: "Transaction already completed" };
        }

        // Mock status logic. PayOS might send "PAID"
        if (status === 'PAID' || status === 'completed') {
            transaction.status = 'completed';
            transaction.paidAt = new Date();
            await transaction.save();

            // Upgrade User
            const user = await User.findById(transaction.userId);
            if (user) {
                user.plan = 'pro';
                const extraMs = 30 * 24 * 60 * 60 * 1000; // 30 days
                if (user.planExpiredAt && user.planExpiredAt > Date.now()) {
                    user.planExpiredAt = new Date(user.planExpiredAt.getTime() + extraMs);
                } else {
                    user.planExpiredAt = new Date(Date.now() + extraMs);
                }
                await user.save();
            }
        } else {
            transaction.status = 'failed';
            await transaction.save();
        }

        return { message: "Webhook processed successfully" };
    }
};

export default TransactionService;
