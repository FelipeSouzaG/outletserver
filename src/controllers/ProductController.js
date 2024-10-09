import { Product } from '../models/Model.js';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

class ProductController {
  static async createProductWithImages(req, res) {
    const { name, details, price, category, stock, type, brand, model, color } =
      req.body;
    const { processedImages } = req;
    if (
      !name ||
      !details ||
      !price ||
      !category ||
      !stock ||
      !type ||
      !brand ||
      !model ||
      !color
    ) {
      return res
        .status(400)
        .json({ message: 'Todos os campos são obrigatórios.' });
    }
    try {
      const imageUrls = await Promise.all(
        processedImages.map(async (image) => {
          const { filename, buffer } = image;
          const key = `${uuidv4()}-${filename}`;
          const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: 'image/webp',
          };
          await s3Client.send(new PutObjectCommand(params));
          return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        })
      );
      const newProduct = new Product({
        name,
        details: Array.isArray(details) ? details : details.split(','),
        price,
        category,
        stock,
        type,
        brand,
        model,
        color,
        images: imageUrls,
      });
      await newProduct.save();
      return res
        .status(201)
        .json({ message: 'Produto criado com sucesso!', product: newProduct });
    } catch (error) {
      console.error('Erro ao criar o produto:', error);
      return res
        .status(500)
        .json({ message: 'Erro ao criar o produto.', error: error.message });
    }
  }

  static listPublicProducts = async (req, res, next) => {
    try {
      const allProducts = await Product.find();
      res.status(200).json(allProducts);
    } catch (error) {
      console.error('Erro no listPublicProducts:', error);
      next(error);
    }
  };

  static async deleteProduct(req, res) {
    const { productId } = req.params;
    try {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado.' });
      }
      await Promise.all(
        product.images.map(async (imageUrl) => {
          const key = imageUrl.split('/').pop();
          const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
          };
          await s3Client.send(new DeleteObjectCommand(params));
        })
      );
      await Product.findByIdAndDelete(productId);
      return res.status(200).json({ message: 'Produto excluído com sucesso.' });
    } catch (error) {
      console.error('Erro ao excluir o produto:', error);
      return res
        .status(500)
        .json({ message: 'Erro ao excluir o produto.', error: error.message });
    }
  }
}

export default ProductController;
