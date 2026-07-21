import { validateEmail } from "../utils/validateEmail.util.js";
import AppError from "../errors/appError.js";
import ErrorCodes from "../errors/errorCodes.js";

const AuthValidator = {
    signUp: (req, res, next) => {
        try {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                return next(AppError.badRequest(ErrorCodes.SYS_002, "Missing required fields"));
            }
            const cleanEmail = validateEmail(email);
            req.body.email = cleanEmail;
            req.body.name = name.trim();

            next();
        } catch (error) {
            next(error);
        }
    },
    signIn: (req, res, next) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return next(AppError.badRequest(ErrorCodes.SYS_002, "Missing required fields"));
            }
            const cleanEmail = validateEmail(email);
            req.body.email = cleanEmail;
            next();
        } catch (error) {
            next(error);
        }
    },
    refresh: (req, res, next) => {
        console.log("Headers:", req.headers.cookie);
        console.log("Cookies:", req.cookies);
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return next(AppError.badRequest(ErrorCodes.SYS_002, "Missing required fields"));
            }
            next();
        } catch (error) {
            next(error);
        }
    },
    logout: (req, res, next) => {
        console.log("Headers:", req.headers.cookie);
        console.log("Cookies:", req.cookies);
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return next(AppError.badRequest(ErrorCodes.SYS_002, "Missing required fields"));
            }
            next();
        } catch (error) {
            next(error);
        }
    }

}
export default AuthValidator;