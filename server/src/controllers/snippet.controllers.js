// Importing required modules and models
import snippetModel from "../models/snippet.models.js";
import userModel from "../models/user.models.js";
import snippetValidator from "../validators/snippet.validators.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// Create a new snippet
const createSnippet = asyncHandler(async (req, res) => {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const { error, value } = snippetValidator.validate(req.body);
    if (error) {
        const errors = error.details.map((detail) => detail.message);
        throw new ApiError(400, "Validation error", [...errors]);
    }

    // Check if the title already exists for the user
    const existingSnippet = await snippetModel.findOne({ title: value.title, createdBy: req.user._id });
    if (existingSnippet) {
        throw new ApiError(409, "title must be unique");
    }

    const { title, language, code, private: isPrivate } = value;
    const snippet = new snippetModel({
        title,
        language,
        code,
        private: isPrivate,
        createdBy: req.user._id, // Assumes user ID is in req.user
    });

    await snippet.save();

    // Add snippet reference to the user
    const user = await userModel.findById(req.user._id);
    user.snippets.push(snippet._id);
    await user.save();

    res.status(201).json(new ApiResponse(201, snippet, "Snippet created successfully"));
});

// Get all snippets of the logged-in user
const getUserSnippets = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }

    const { page = 1, limit = 8 } = req.query;
    const totalSnippets = await snippetModel.countDocuments({ createdBy: req.user._id });

    const user = await userModel.findById(req.user._id).populate({
        path: 'snippets',
        options: {
            skip: (page - 1) * limit,
            limit: parseInt(limit, 10),
            sort: { createdAt: -1 },
        },
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const snippets = user.snippets;
    const hasMore = (totalSnippets - (page * limit)) > 0;

    res.status(200).json(
        new ApiResponse(200, { snippets, hasMore }, "Snippets fetched successfully")
    );
});


// Get a single snippet by ID

const getSnippetById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Populate specific fields if needed
    const snippet = await snippetModel.findById(id).populate();

    if (!snippet) {
        throw new ApiError(404, "Snippet not found");
    }

    if (snippet.private && snippet.createdBy.toString()!== req.user._id.toString() && !snippet.canAccess.includes(req.user._id)) {
        throw new ApiError(403, "Access denied");
    }

    res.status(200).json(new ApiResponse(200, snippet, "Snippet fetched successfully"));
});


// Search and get snippets matching a query
const searchSnippets = asyncHandler(async (req, res) => {
    const { query, page = 1, limit = 10 } = req.query;

    const snippets = await snippetModel
        .find({
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
                        { language: { $regex: query, $options: "i" } },
                        { title: { $regex: query, $options: "i" } },
                    ],
                },
            ],
        })
        .populate("createdBy", "username") // Populates 'createdBy' with 'username'
        .select('language title createdBy') // Select specific fields
        .skip((page - 1) * limit)
        .limit(parseInt(limit, 10))
        .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, snippets, "Snippets fetched successfully"));
});



// add or remove snippet access is remianing here
// Update a snippet
const updateSnippet = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { error, value } = snippetValidator.updateSnippet(req.body);
    if (error) {
        const errors = error.details.map((detail) => detail.message);
        throw new ApiError(400, "Validation error", [...errors]);
    }

    const { title, language, private: isPrivate } = value;

    const snippet = await snippetModel.findById(id);
    if (!snippet) throw new ApiError(404, "Snippet not found");

    // Ensure only the creator or users with access can update
    if (snippet.createdBy.toString() !== req.user._id.toString() && !snippet.canAccess.includes(req.user._id)) {
        throw new ApiError(403, "Access denied");
    }

    snippet.title = title || snippet.title;
    snippet.language = language || snippet.language;
    snippet.private = isPrivate !== undefined ? isPrivate : snippet.private;

    await snippet.save();
    res.status(200).json(new ApiResponse(200, snippet, "Snippet updated successfully"));
});

// Delete a snippet
const deleteSnippet = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const snippet = await snippetModel.findById(id);
    if (!snippet) throw new ApiError(404, "Snippet not found");

    // Ensure only the creator can delete
    if (snippet.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Access denied");
    }

    await snippetModel.findByIdAndDelete(id);
    res.status(200).json(new ApiResponse(200, null, "Snippet deleted successfully"));
});

// Like/Unlike a snippet (toggle)
const toggleLikeSnippet = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const snippet = await snippetModel.findById(id);

    if (!snippet) throw new ApiError(404, "Snippet not found");

    const userId = req.user._id;
    const likeIndex = snippet.likes.indexOf(userId);

    if (likeIndex === -1) {
        // Not liked yet, add like
        snippet.likes.push(userId);
    } else {
        // Already liked, remove like
        snippet.likes.splice(likeIndex, 1);
    }

    await snippet.save();
    res.status(200).json(new ApiResponse(200, snippet, likeIndex === -1 ? "Snippet liked" : "Snippet unliked"));
});

// Get random public snippets
const getRandomSnippets = asyncHandler(async (req, res) => {
    const { limit = 4 } = req.query;

    const snippets = await snippetModel.aggregate([
        { $match: { private: false } },
        { $sample: { size: parseInt(limit, 10) } }
    ]);

    const populatedSnippets = await snippetModel.populate(snippets, { path: 'createdBy', select: 'username' });

    res.status(200).json(new ApiResponse(200, populatedSnippets, "Random snippets fetched successfully"));
});

const updateSnippetCode = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { code } = req.body;

    const snippet = await snippetModel.findById(id);
    if (!snippet) throw new ApiError(404, "Snippet not found");
    if (snippet.createdBy.toString()!== req.user._id.toString() && !snippet.canAccess.includes(req.user._id)) {
        throw new ApiError(403, "Access denied");
    }
    snippet.code = code;
    await snippet.save();
    res.status(200).json(new ApiResponse(200, snippet, "Snippet code updated successfully"));
});

export {
    createSnippet,
    getUserSnippets,
    getSnippetById,
    searchSnippets,
    updateSnippet,
    deleteSnippet,
    toggleLikeSnippet,
    getRandomSnippets,
    updateSnippetCode,
}