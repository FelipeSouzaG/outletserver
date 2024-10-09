import express from 'express';
import OrderController from '../controllers/OrderController.js';
import Auth from '../middlewares/auth.js';

const router = express.Router();

router
  .post('/register', Auth.authenticateUser, OrderController.registerOrder)
  .get(
    '/allorders',
    Auth.authenticateUser,
    Auth.authorizeAdmin,
    OrderController.listAllOrders
  )
  .put(
    '/update/:orderId/status',
    Auth.authenticateUser,
    Auth.authorizeAdmin,
    OrderController.updateOrderStatus
  );

export default router;
