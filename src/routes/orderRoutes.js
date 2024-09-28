import express from "express";
import OrderController from "../controllers/OrderController.js";
import Auth from "../middlewares/auth.js";

const router = express.Router();

router
  .post("/user/orders", Auth.authenticateUser, OrderController.registerOrder)
  .get("/user/orders/:orderId", Auth.authenticateUser, OrderController.getOrder)
  .put("/user/orders/:orderId", Auth.authenticateUser, OrderController.updateOrder)
  .delete("/user/orders/:orderId", Auth.authenticateUser, OrderController.deleteOrder)
  .get("/user/orders", Auth.authenticateUser, OrderController.listAllOrders)
  .put("/user/orders/:orderId/status", Auth.authenticateUser, OrderController.updateOrderStatus); // Nova rota para atualizar status

export default router;