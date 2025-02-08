import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import userModel from "../models/user.models.js";
import asyncHandler from "../utils/asyncHandler.js";

const isAuthenticated = asyncHandler(async (req, _, next) => {

    // Check if user is authenticated via Google (for session-based authentication)
    if (req.user) {
        return next(); // If `req.user` is already populated by Passport, allow access
    }

    // Check for Authorization header for JWT token
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        // Extract token from the header
        const token = authHeader.split(" ")[1];

        // Verify the token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Attach the authenticated user to the request
        const user = await userModel
            .findById(decoded._id)
            .select("-password -refreshtoken");

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        req.user = user;
        return next();
    }

    // check for authorization with cookies
    // const refreshToken = req.cookies.refreshToken;
    // if (refreshToken) {
    //     const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    //     // Attach the authenticated user to the request
    //     const user = await userModel
    //         .findById(decoded._id)
    //         .select("-password -refreshtoken");
            
    //     if (!user) {
    //         throw new ApiError(404, "User not found");
    //     }
    //     req.user = user;
    //     return next();
    // }

    throw new ApiError(401, "Authorization token is missing or invalid");
});

export default isAuthenticated;
