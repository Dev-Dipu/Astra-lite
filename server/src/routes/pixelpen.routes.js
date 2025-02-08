import express from "express";
import {
  createPixelPen,
  getUserPixelPens,
  searchPixelPens,
  updatePixelPen,
  deletePixelPen,
  toggleLikePixelPen,
  getRandomPixelPens,
  updatePixelPenCode,
} from "../controllers/pixelpen.controllers.js";
import isAuthenticated from "../middlewares/auth.middlewares.js";

const router = express.Router();

// Apply isAuthenticated middleware to all routes
router.use(isAuthenticated);

// Create a new PixelPen
router.post("/", createPixelPen);

// Get all PixelPens of the logged-in user
router.get("/", getUserPixelPens);

// Search PixelPens
router.get("/search", searchPixelPens);

// Update a PixelPen
router.patch("/:id", updatePixelPen);

// Delete a PixelPen
router.delete("/:id", deletePixelPen);

// Like/Unlike a PixelPen
router.post("/like/:id", toggleLikePixelPen);

// Get random public PixelPens
router.get("/random", getRandomPixelPens);

// Update PixelPen code
router.post("/save/:id", updatePixelPenCode);

export default router;
