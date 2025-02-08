import Joi from "joi";

const pixelpenValidator = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100)
    .required()
    .trim()
    .messages({
      "string.min": "Title must be at least 3 characters long",
      "string.max": "Title must not exceed 100 characters",
    }),

  html: Joi.string()
    .optional()
    .trim(),

  css: Joi.string()
    .optional()
    .trim(),

  javascript: Joi.string()
    .optional()
    .trim(),

  private: Joi.boolean().default(false),

  canAccess: Joi.array()
    .items(Joi.string().hex().length(24)) // Array of valid ObjectIds
    .messages({
      "string.hex": "canAccess must contain valid ObjectIds",
    }),

  likes: Joi.array()
    .items(Joi.string().hex().length(24)) // Array of valid ObjectIds
    .messages({
      "string.hex": "likes must contain valid ObjectIds",
    }),

  createdBy: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      "string.hex": "createdBy must be a valid ObjectId",
      "any.required": "Creator of the PixelPen is required",
    }),
});

export default pixelpenValidator;
