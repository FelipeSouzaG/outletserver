import express from "express";
import { upload, ImageMiddleware } from "../middlewares/storage.js";
import ImageController from "../controllers/ImageController.js";
import Auth from "../middlewares/auth.js";

const router = express.Router();

router.post(
  "/images/upload",
  Auth.authenticateUser,
  Auth.authorizeAdmin,
  upload.array("image", 10), // Aceita até 10 imagens com o campo "image"
  ImageMiddleware.processImages,
  ImageController.uploadImagesToS3
);

export default router;