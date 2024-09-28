import express from "express";
import ProductController from "../controllers/ProductController.js";
import Auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/products", Auth.authenticateUser, Auth.authorizeAdmin, ProductController.registerProduct);
router.get("/products/:id", Auth.authenticateUser, Auth.authorizeAdmin, ProductController.getProduct);
router.put("/products/:id", Auth.authenticateUser, Auth.authorizeAdmin, ProductController.updateProduct);
router.delete("/products/:id", Auth.authenticateUser, Auth.authorizeAdmin, ProductController.deleteProduct);
router.get("/products", Auth.authenticateUser, Auth.authorizeAdmin, ProductController.listAllProducts);

export default router;