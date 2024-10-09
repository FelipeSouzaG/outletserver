import { Cart, Product } from '../models/Model.js';
import NotFound from '../erros/NotFound.js';

class CartController {
  static addItem = async (req, res, next) => {
    try {
      const userId = req.userData.userId;
      const { productId, quantity } = req.body;
      const product = await Product.findById(productId);
      if (!product) {
        throw new NotFound(`Produto com o ID ${productId} não encontrado.`);
      }
      if (product.stock < quantity) {
        return res.status(400).json({
          message: `Estoque insuficiente para ${product.name}. Disponível: ${product.stock}`,
        });
      }
      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }
      const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );
      if (existingItemIndex !== -1) {
        if (cart.items[existingItemIndex].quantity + quantity > product.stock) {
          return res.status(400).json({
            message: `Estoque insuficiente para ${product.name}. Disponível: ${product.stock}`,
          });
        }
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
      cart.updatedAt = Date.now();
      await cart.save();
      await cart.populate('items.product');
      res.status(201).json(cart);
    } catch (error) {
      console.error('Erro no addItem:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
      } else {
        next(error);
      }
    }
  };

  static getCart = async (req, res, next) => {
    try {
      const userId = req.userData.userId;
      const cart = await Cart.findOne({ user: userId }).populate(
        'items.product'
      );
      if (!cart) {
        return res.status(200).json({ message: 'Carrinho vazio.' });
      }
      res.status(200).json(cart);
    } catch (error) {
      next(error);
    }
  };

  static removeItem = async (req, res, next) => {
    try {
      const userId = req.userData.userId;
      const { productId } = req.body;
      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(200).json({ message: 'Carrinho vazio.' });
      }
      const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );
      if (existingItemIndex !== -1) {
        const product = await Product.findById(productId);
        cart.items[existingItemIndex].quantity -= 1;
        if (cart.items[existingItemIndex].quantity <= 0) {
          cart.items.splice(existingItemIndex, 1);
          if (cart.items.length === 0) {
            await Cart.findByIdAndDelete(cart._id);
            return res.status(200).json({
              message: `Removido 1 ${product.name} do carrinho. Carrinho vazio.`,
            });
          } else {
            cart.updatedAt = Date.now();
            await cart.save();
            await cart.populate('items.product');
            return res.status(200).json({
              message: `Removido 1 ${product.name} do carrinho.`,
              cart,
            });
          }
        } else {
          cart.updatedAt = Date.now();
          await cart.save();
          await cart.populate('items.product');
          return res.status(200).json({
            message: `Removido 1 ${product.name} do carrinho.`,
            cart,
          });
        }
      } else {
        const product = await Product.findById(productId);
        const message = product
          ? `Não há ${product.name} no carrinho.`
          : 'Produto não encontrado.';
        await cart.populate('items.product');
        return res.status(200).json({
          message,
          cart: cart.items.length > 0 ? cart : null,
        });
      }
    } catch (error) {
      next(error);
    }
  };

  static clearCart = async (req, res, next) => {
    try {
      const userId = req.userData.userId;
      const result = await Cart.findOneAndDelete({ user: userId });
      if (!result) {
        return res.status(404).json({ message: 'Carrinho não encontrado.' });
      }
      res.status(200).json({ message: 'Carrinho limpo com sucesso.' });
    } catch (error) {
      next(error);
    }
  };
}

export default CartController;
