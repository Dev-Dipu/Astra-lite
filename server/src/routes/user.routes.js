import { Router } from "express";
import {
    registerUser,
    loginUser,
    checkAuth,
    getUserProfile,
    logoutUser,
    updateUserProfile,
    refreshAccessToken,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import isAuthenticated from "../middlewares/auth.middlewares.js";

const router = Router();

// Register route
router.route("/register").post(upload.single("avatar"), registerUser);

// Login route
router.route("/login").post(loginUser);

// Check auth route
router.route("/check-auth").get(isAuthenticated, checkAuth);

// Get user profile route
router.route("/profile").get(isAuthenticated, getUserProfile);

// Logout route
router.route("/logout").post(isAuthenticated, logoutUser);

// Update profile route
router
    .route("/profile")
    .put(isAuthenticated, upload.single("avatar"), updateUserProfile);

// Refresh token route
router.route("/refresh-token").post(refreshAccessToken);

export default router;
