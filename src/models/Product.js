import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'O nome do produto é obrigatório.'],
    trim: true,
    minlength: [3, 'O nome do produto deve ter no mínimo 3 caracteres.'],
    maxlength: [100, 'O nome do produto deve ter no máximo 100 caracteres.'],
  },
  details: {
    type: [String],
    validate: {
      validator: function (v) {
        return v.length % 2 === 0;
      },
      message: 'O array de detalhes deve conter pares de propriedade e valor.',
    },
  },
  price: {
    type: Number,
    required: [true, 'O preço do produto é obrigatório.'],
    min: [0, 'O preço do produto deve ser maior ou igual a zero.'],
  },
  category: {
    type: String,
    required: [true, 'A categoria do produto é obrigatória.'],
    trim: true,
    enum: {
      values: [
        'Eletrônicos',
        'Utilitários',
        'Acessórios para celular',
        'Acessórios para carros',
        'Outros',
      ],
      message: 'Categoria inválida.',
    },
  },
  stock: {
    type: Number,
    required: [true, 'O estoque do produto é obrigatório.'],
    min: [0, 'O estoque do produto deve ser maior ou igual a zero.'],
  },
  type: {
    type: String,
    required: [true, 'O tipo de produto é obrigatório.'],
    trim: true,
  },
  brand: {
    type: String,
    required: [true, 'A marca do produto é obrigatória.'],
    trim: true,
  },
  model: {
    type: String,
    required: [true, 'O modelo do produto é obrigatório.'],
    trim: true,
  },
  color: {
    type: String,
    required: [true, 'A cor do produto é obrigatória.'],
    trim: true,
  },
  images: {
    type: [String],
    validate: {
      validator: function (v) {
        return (
          Array.isArray(v) &&
          v.every((str) =>
            /^(https?:\/\/)([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(
              str
            )
          )
        );
      },
      message: 'Uma ou mais URLs fornecidas não são válidas.',
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

const Product = mongoose.model('Product', productSchema);

export default Product;
