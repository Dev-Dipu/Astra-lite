import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import userValidator from "../validators/user.validators.js";
import userModel from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { DEFAULT_AVATAR } from "../constant.js";
import cleanUpTemp from "../utils/cleanUpTemp.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path; // Save file path early for cleanup
    // Validate the request body
    const { error, value } = userValidator.validate(req.body);
    if (error) {
        const errors = error.details.map((detail) => detail.message);
        throw new ApiError(400, "Validation error", [...errors]);
    }

    const { username, fullname, email, password } = value;

    // Check if user already exists
    const existingUser = await userModel.findOne({
        $or: [{ username: username.toLowerCase() }, { email }],
    });
    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    let avatar = avatarLocalPath
        ? await uploadOnCloudinary(avatarLocalPath)
        : "";

    // Create a new user
    const user = await userModel.create({
        username: username.toLowerCase(),
        fullname,
        email,
        password, // Password will be hashed in the pre-save hook
        avatar: avatar?.secure_url || avatar?.url || DEFAULT_AVATAR,
    });

    const createdUser = await userModel
        .findById(user._id)
        .select("-password -refreshtoken");

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering a user"
        );
    }

    // Generate tokens
    const accessToken = createdUser.generateAccessToken();
    const refreshToken = createdUser.generateRefreshToken();

    // Save refresh token to the database
    createdUser.refreshtoken = refreshToken;
    await createdUser.save();

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Set to true in production
        sameSite: "None"
    };

    return res
        .status(201)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                201,
                { accessToken },
                "User registered successfully"
            )
        );
    // Ensure cleanup always runs
    if (avatarLocalPath) await cleanUpTemp(avatarLocalPath);
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await userModel.findOne({ email });
    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    const isMatch = await user.checkPassword(password);
    if (!isMatch) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token to the database
    user.refreshtoken = refreshToken;
    await user.save();

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Set to true in production
        sameSite: "None"
    }

    // Send tokens in response
    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken },
                "Login successful"
            )
        );
});

const checkAuth = (req, res) => {
    // If isAuthenticated middleware passes, req.user will be populated
    if (req.user) {
        res.status(200).json({ success: true, user: req.user });
    } else {
        res.status(401).json({ success: false, message: "Not authenticated" });
    }
}

const getUserProfile = asyncHandler(async (req, res) => {
    const user = await userModel
        .findById(req.user._id)
        .select("-password -refreshtoken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User profile fetched successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
    // Check if the user is logged in via Google (passport session)
    if (req.isAuthenticated()) {
        // Logout from Google (passport session)
        req.logout((err) => {
            if (err) throw new ApiError(500, "Failed to logout from Google.");
        });
    }

    // Clear JWT tokens from cookies
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Set to true in production
        sameSite: "None"
    };

    // Clear access and refresh tokens
    res.clearCookie("refreshToken", options).json(
        new ApiResponse(200, null, "Logout successful")
    );
});

const updateUserProfile = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path; // Save file path early for cleanup
    const { error, value } = userValidator.validate(req.body, {
        allowUnknown: true,
    });
    if (error) {
        const errors = error.details.map((detail) => detail.message);
        throw new ApiError(400, "Validation error", [...errors]);
    }

    const { username, fullname, email } = value;

    let avatar;
    if (avatarLocalPath) {
        // Upload the new avatar if provided
        avatar = await uploadOnCloudinary(avatarLocalPath);
    } else {
        // Fetch the current avatar from the user profile
        const currentUser = await userModel.findById(req.user._id);
        avatar = { url: currentUser.avatar };
    }

    const updatedData = {
        ...(username && { username: username.toLowerCase() }), // Only update if provided
        ...(fullname && { fullname }),
        ...(email && { email }),
        avatar: avatar?.secure_url || avatar?.url || DEFAULT_AVATAR,
    };

    const updatedUser = await userModel
        .findByIdAndUpdate(req.user._id, updatedData, { new: true })
        .select("-password -refreshtoken");

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedUser,
                "User profile updated successfully"
            )
        );

    // Ensure cleanup always runs
    if (avatarLocalPath) await cleanUpTemp(avatarLocalPath);
});

const refreshAccessToken = asyncHandler(async (req, res, next) => {
    // Check if the user is logged in via Google (passport session)
    if (req.isAuthenticated()) return next();
    const { refreshToken } = req.cookies || req.body;

    if (!refreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    const user = await userModel.findOne({ refreshtoken: refreshToken });
    if (!user) {
        throw new ApiError(403, "Invalid refresh token");
    }

    if (refreshToken !== user.refreshtoken) {
        throw new ApiError(403, "Invalid refresh token");
    }

    // Verify refresh token
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Generate new access token
    const newAccessToken = user.generateAccessToken();
    // const newRefreshToken = user.generateRefreshToken();

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Set to true in production
        sameSite: "None"
    };

    return res
        .status(200)
        // .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken: newAccessToken },
                "Token refreshed successfully"
            )
        );
});

export {
    registerUser,
    loginUser,
    checkAuth,
    getUserProfile,
    logoutUser,
    updateUserProfile,
    refreshAccessToken,
};
