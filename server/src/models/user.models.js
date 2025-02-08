import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
            index: true,
            minlength: 3,
            maxlength: 30,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 50,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            minlength: 8,
            required: function () {
                return !this.googleId;
            },
        },
        avatar: {
            type: String,
            default:
                "https://res.cloudinary.com/dzdvg6rle/image/upload/v1734451637/default-avatar.webp",
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true, // Allows null values while maintaining uniqueness
        },
        snippets: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Snippet",
            },
        ],
        pixelpens: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "PixelPen",
            },
        ],
        followers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        following: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        refreshtoken: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    if (this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

userSchema.methods.checkPassword = async function (password) {
    return this.password ? await bcrypt.compare(password, this.password) : false;
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export default model("User", userSchema);