import multer from "multer";

const storage = multer.memoryStorage();

export const uploadImageMiddleware = multer({ storage }).single("image");