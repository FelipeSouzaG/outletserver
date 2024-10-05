import express from "express";
import CartController from "../controllers/CartController.js";
import Auth from "../middlewares/auth.js";

const router = express.Router();

router
  .post("/additem", Auth.authenticateUser, CartController.addItem)
  .get("/datacart", Auth.authenticateUser, CartController.getCart)
  .delete("/deleteitem", Auth.authenticateUser, CartController.removeItem)
  .delete("/cartclear", Auth.authenticateUser, CartController.clearCart);
  
export default router;