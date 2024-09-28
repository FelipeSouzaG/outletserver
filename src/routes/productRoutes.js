import express from "express";
import { upload } from "../middlewares/storage.js";
import ProductController from "../controllers/ProductController.js";
import Auth from "../middlewares/auth.js";
import { ImageMiddleware } from "../middlewares/storage.js";

const router = express.Router();

router.post(
  "/products",
  Auth.authenticateUser,
  Auth.authorizeAdmin,
  upload.array("image", 10),
  ImageMiddleware.processImages,
  ProductController.createProductWithImages
);

export default router;
