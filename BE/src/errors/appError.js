import HttpStatus from "./httpStatus.js";
class AppError extends Error {
    constructor(statusCode, errorCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true;
        this.timestamp = new Date().toISOString();
    }
    static badRequest(errorCode, message) {
        return new AppError(HttpStatus.BAD_REQUEST, errorCode, message);
    }

    static unauthorized(errorCode, message) {
        return new AppError(HttpStatus.UNAUTHORIZED, errorCode, message);
    }

    static forbidden(errorCode, message) {
        return new AppError(HttpStatus.FORBIDDEN, errorCode, message);
    }

    static notFound(errorCode, message) {
        return new AppError(HttpStatus.NOT_FOUND, errorCode, message);
    }

    static conflict(errorCode, message) {
        return new AppError(HttpStatus.CONFLICT, errorCode, message);
    }

    static gone(errorCode, message) {
        return new AppError(HttpStatus.GONE, errorCode, message);
    }

    static unprocessable(errorCode, message) {
        return new AppError(HttpStatus.UNPROCESSABLE_ENTITY, errorCode, message);
    }

    static internal(errorCode, message) {
        return new AppError(HttpStatus.INTERNAL_SERVER_ERROR, errorCode, message);
    }
    static tooManyRequests(errorCode, message) {
        return new AppError(HttpStatus.TOO_MANY_REQUESTS, errorCode, message);
    }
}
export default AppError;