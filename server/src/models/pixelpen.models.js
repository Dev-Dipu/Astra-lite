import mongoose, { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const pixelPenSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    html: {
      type: String,
      trim: true,
      default: "",
    },
    css: {
      type: String,
      trim: true,
      default: "",
    },
    javascript: {
      type: String,
      trim: true,
      default: "",
    },
    private: {
      type: Boolean,
      default: false,
    },
    canAccess: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Users who can access the PixelPen
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Users who liked the PixelPen
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // The creator of the PixelPen
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

pixelPenSchema.plugin(mongooseAggregatePaginate);

export default model("Pixelpen", pixelPenSchema);