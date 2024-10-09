import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [
    {
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
      price: {
        type: Number,
        required: true,
        min: [0, 'O preço deve ser maior ou igual a zero.'],
      },
    },
  ],
  status: {
    type: String,
    enum: {
      values: ['pendente pagamento', 'pedido em entrega', 'finalizado'],
      message: 'Status inválido.',
    },
    default: 'pendente pagamento',
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'O total deve ser maior ou igual a zero.'],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  orderNumber: { type: String, required: true, unique: true },
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
