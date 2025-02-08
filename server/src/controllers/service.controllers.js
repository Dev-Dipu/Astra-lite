import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import userModel from "../models/user.models.js";

const checkunique = asyncHandler(async (req, res) => {
    const { field, value } = req.params;

    // Validate input to prevent invalid fields
    if (!["email", "username"].includes(field)) {
        return res.status(400).json(new ApiResponse(400, false, "Invalid field"));
    }

    try {
        // Use dynamic key for the query
        const query = { [field]: value };

        // Check if the field's value exists in the database
        const user = await userModel.findOne(query);

        if (user) {
            return res.status(200).json(new ApiResponse(409, false, `${field} is already taken`));
        }

        return res.status(200).json(new ApiResponse(200, true, `${field} is available`));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, false, "Internal server error"));
    }
});

export { checkunique };
