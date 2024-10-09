import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'A quantidade deve ser maior ou igual a 1.'],
    validate: {
      validator: function (v) {
        return Number.isInteger(v);
      },
      message: 'A quantidade deve ser um número inteiro.',
    },
  },
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [cartItemSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
