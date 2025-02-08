// Importing required modules and models
import pixelpenModel from "../models/pixelpen.models.js";
import userModel from "../models/user.models.js";
import pixelpenValidator from "../validators/pixelpen.validators.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// Create a new PixelPen
const createPixelPen = asyncHandler(async (req, res) => {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const { error, value } = pixelpenValidator.createPixelPen(req.body);
    if (error) {
        const errors = error.details.map((detail) => detail.message);
        throw new ApiError(400, "Validation error", [...errors]);
    }

    const { title, html, css, javascript, private: isPrivate } = value;
    const pixelPen = new pixelpenModel({
        title,
        html,
        css,
        javascript,
        private: isPrivate,
        createdBy: req.user._id,
    });

    await pixelPen.save();

    // Add PixelPen reference to the user
    const user = await userModel.findById(req.user._id);
    user.pixelPens.push(pixelPen._id);
    await user.save();

    res.status(201).json(new ApiResponse(201, pixelPen, "PixelPen created successfully"));
});

// Get all PixelPens of the logged-in user
const getUserPixelPens = asyncHandler(async (req, res) => {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const { page = 1, limit = 10 } = req.query;

    const user = await userModel.findById(req.user._id).populate({
        path: "pixelPens",
        options: {
            skip: (page - 1) * limit,
            limit: parseInt(limit, 10),
            sort: { createdAt: -1 },
        },
    });

    res.status(200).json(new ApiResponse(200, user.pixelPens, "PixelPens fetched successfully"));
});

// Search PixelPens by title or creator
const searchPixelPens = asyncHandler(async (req, res) => {
    const { query, page = 1, limit = 10 } = req.query;

    const pixelPens = await pixelpenModel.find({
        $and: [
            {
                $or: [
                    { private: false },
                    { createdBy: req.user ? req.user._id : undefined },
                    { canAccess: req.user ? req.user._id : undefined },
                ],
            },
            {
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { html: { $regex: query, $options: "i" } },
                ],
            },
        ],
    })
        .skip((page - 1) * limit)
        .limit(parseInt(limit, 10))
        .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, pixelPens, "PixelPens fetched successfully"));
});

// Update a PixelPen
const updatePixelPen = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { error, value } = pixelpenValidator.updatePixelPen(req.body);
    if (error) {
        const errors = error.details.map((detail) => detail.message);
        throw new ApiError(400, "Validation error", [...errors]);
    }

    const { title, html, css, javascript, private: isPrivate } = value;

    const pixelPen = await pixelpenModel.findById(id);
    if (!pixelPen) throw new ApiError(404, "PixelPen not found");

    // Ensure only the creator or users with access can update
    if (pixelPen.createdBy.toString() !== req.user._id.toString() && !pixelPen.canAccess.includes(req.user._id)) {
        throw new ApiError(403, "Access denied");
    }

    pixelPen.title = title || pixelPen.title;
    pixelPen.html = html || pixelPen.html;
    pixelPen.css = css || pixelPen.css;
    pixelPen.javascript = javascript || pixelPen.javascript;
    pixelPen.private = isPrivate !== undefined ? isPrivate : pixelPen.private;

    await pixelPen.save();
    res.status(200).json(new ApiResponse(200, pixelPen, "PixelPen updated successfully"));
});

// Delete a PixelPen
const deletePixelPen = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const pixelPen = await pixelpenModel.findById(id);
    if (!pixelPen) throw new ApiError(404, "PixelPen not found");

    // Ensure only the creator can delete
    if (pixelPen.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Access denied");
    }

    await pixelpenModel.findByIdAndDelete(id);
    res.status(200).json(new ApiResponse(200, null, "PixelPen deleted successfully"));
});

// Like/Unlike a PixelPen
const toggleLikePixelPen = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const pixelPen = await pixelpenModel.findById(id);

    if (!pixelPen) throw new ApiError(404, "PixelPen not found");

    const userId = req.user._id;
    const likeIndex = pixelPen.likes.indexOf(userId);

    if (likeIndex === -1) {
        pixelPen.likes.push(userId);
    } else {
        pixelPen.likes.splice(likeIndex, 1);
    }

    await pixelPen.save();
    res.status(200).json(new ApiResponse(200, pixelPen, likeIndex === -1 ? "PixelPen liked" : "PixelPen unliked"));
});

// Get random public PixelPens
const getRandomPixelPens = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    const pixelPens = await pixelpenModel.aggregate([
        { $match: { private: false } },
        { $sample: { size: parseInt(limit, 10) } },
    ]);

    res.status(200).json(new ApiResponse(200, pixelPens, "Random PixelPens fetched successfully"));
});

const updatePixelPenCode = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { html, css, javascript } = req.body;
    const pixelPen = await pixelpenModel.findById(id);
    if (!pixelPen) throw new ApiError(404, "PixelPen not found");
    if (pixelPen.createdBy.toString()!== req.user._id.toString() && !pixelPen.canAccess.includes(req.user._id)) {
        throw new ApiError(403, "Access denied");
    }
    pixelPen.html = html || pixelPen.html;
    pixelPen.css = css || pixelPen.css;
    pixelPen.javascript = javascript || pixelPen.javascript;
    await pixelPen.save();
    res.status(200).json(new ApiResponse(200, pixelPen, "PixelPen code updated successfully"));
});

export {
    createPixelPen,
    getUserPixelPens,
    searchPixelPens,
    updatePixelPen,
    deletePixelPen,
    toggleLikePixelPen,
    getRandomPixelPens,
    updatePixelPenCode,
};
