import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
    let error = { ...err };

    // If error is not an instance of ApiError, wrap it
    if (!(error instanceof ApiError)) {
        const statusCode =
            err.name === "TokenExpiredError" || err.name === "JsonWebTokenError"
                ? 401 // Ensure 401 for token-related issues
                : error.statusCode || (error instanceof mongoose.Error ? 400 : 500);

        const message =
            err.name === "TokenExpiredError"
                ? "Token expired, please log in again"
                : err.message || "Something went wrong";

        error = new ApiError(statusCode, message, error?.errors || []);
    }

    const response = {
        statusCode: error.statusCode || 500,
        success: false,
        message: error.message || "Server Error",
        errors: error.errors || [],
    };

    return res.status(error.statusCode).json(response);
};

export default errorHandler;
