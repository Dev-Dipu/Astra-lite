import Joi from "joi";

const userValidator = Joi.object({
    username: Joi.string()
        .min(3)
        .max(30)
        .required()
        .trim()
        .messages({
            "string.min": "Username must be at least 3 characters long",
            "string.max": "Username must be at most 30 characters long",
        }),

    fullname: Joi.string()
        .min(3)
        .max(50)
        .required()
        .trim()
        .messages({
            "string.min": "Full name must be at least 3 characters long",
            "string.max": "Full name must be at most 50 characters long",
        }),

    email: Joi.string()
        .email()
        .required()
        .lowercase()
        .trim()
        .messages({
            "string.email": "Please provide a valid email address",
        }),

    password: Joi.string()
        .min(8)
        .optional()
        .messages({
            "string.min": "Password must be at least 8 characters long",
        }),

    avatar: Joi.optional(),

    snippets: Joi.array().items(Joi.string().hex().length(24)), // Array of ObjectId strings
    pixelpens: Joi.array().items(Joi.string().hex().length(24)), // Array of ObjectId strings
    followers: Joi.array().items(Joi.string().hex().length(24)), // Array of ObjectId strings
    following: Joi.array().items(Joi.string().hex().length(24)), // Array of ObjectId strings
    refreshtoken: Joi.string().optional(),

    googleId: Joi.string().optional(),
});

export default userValidator;