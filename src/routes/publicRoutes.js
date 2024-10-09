import express from 'express';
import ProductController from '../controllers/ProductController.js';

const router = express.Router();

router.get('/products', ProductController.listPublicProducts);

export default router;
