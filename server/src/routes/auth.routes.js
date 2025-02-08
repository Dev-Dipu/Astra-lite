import { Router } from "express";
import passport from "passport";
import isAuthenticated from "../middlewares/auth.middlewares.js";

const router = Router();

// Redirect to Google's OAuth 2.0 consent page
router.route("/").get(
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback URL
router.route("/callback").get(
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: true, // Use sessions for Google login
  }),
  (req, res) => {
    // Redirect to frontend with user details or token
    res.redirect(`${process.env.CORS_ORIGIN}/snippets`);
  }
);

export default router;