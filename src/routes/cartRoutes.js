import express from "express";
import CartController from "../controllers/CartController.js";
import Auth from "../middlewares/auth.js";

const router = express.Router();

router
  .post("/user/cart", Auth.authenticateUser, CartController.addItem)
  .get("/user/cart", Auth.authenticateUser, CartController.getCart)
  .delete("/user/cart", Auth.authenticateUser, CartController.removeItem)
  .delete("/user/cart/delete", Auth.authenticateUser, CartController.clearCart);
  
export default router;