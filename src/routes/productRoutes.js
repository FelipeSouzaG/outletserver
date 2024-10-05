import express from "express";
import { upload } from "../middlewares/storage.js";
import ProductController from "../controllers/ProductController.js";
import Auth from "../middlewares/auth.js";
import { ImageMiddleware } from "../middlewares/storage.js";

const router = express.Router();

router.post(
  "/register",
  Auth.authenticateUser,
  Auth.authorizeAdmin,
  upload.array("images", 10),
  ImageMiddleware.processImages,
  ProductController.createProductWithImages
);

// Nova rota: Excluir um produto
router.delete(
 "/delete/:productId",
 Auth.authenticateUser,
 Auth.authorizeAdmin,
 ProductController.deleteProduct
);

export default router;
