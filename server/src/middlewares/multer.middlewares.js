import multer from "multer";
import path from "path";
import fs from "fs/promises";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 999999);
        const extname = path.extname(file.originalname);
        cb(null, file.fieldname + uniqueSuffix + extname);
    },
});

export const upload = multer({
    storage,
});
