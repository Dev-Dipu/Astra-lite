import express from "express";
import {
  createSnippet,
  getUserSnippets,
  getSnippetById,
  searchSnippets,
  updateSnippet,
  deleteSnippet,
  toggleLikeSnippet,
  getRandomSnippets,
  updateSnippetCode,
} from "../controllers/snippet.controllers.js";
import isAuthenticated from "../middlewares/auth.middlewares.js";

const router = express.Router();

// Apply isAuthenticated middleware to all routes
router.use(isAuthenticated);

// Create a new snippet
router.post("/", createSnippet);

// Get all snippets of the logged-in user
router.get("/", getUserSnippets);

// Route to get random public snippets
router.get("/random", getRandomSnippets);

// Search snippets
router.get("/search", searchSnippets);

// Get snippet by ID
router.get("/:id", getSnippetById);

// Update a snippet
router.patch("/:id", updateSnippet);

// Delete a snippet
router.delete("/:id", deleteSnippet);

// Like/Unlike a snippet
router.post("/like/:id", toggleLikeSnippet);


router.patch("/save/:id", updateSnippetCode);

export default router;