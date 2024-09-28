import NotFound from "../erros/NotFound.js";
import { Product } from "../models/Model.js";
import Joi from "joi";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: process.env.AWS_REGION });

class ProductController {
  
  static registerProduct = async (req, res, next) => {
    const productSchema = Joi.object({
      name: Joi.string().min(3).max(100).required(),
      price: Joi.number().min(0).required(),
      category: Joi.string().valid("Eletrônicos", "Utilitários", "Acessórios para celular", "Acessórios para carros", "Outros").required(),
      stock: Joi.number().min(0).required(),
      details: Joi.array().items(Joi.string()),
      type: Joi.string().required(),
      brand: Joi.string().required(),
      model: Joi.string().required(),
      color: Joi.string().required(),
      images: Joi.array().items(Joi.string().uri()),
    });

    try {
      const { error } = productSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const newProduct = new Product(req.body);
      const product = await newProduct.save();
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  };

  static getProduct = async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        throw new NotFound("Produto não encontrado.");
      }
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  };

  static updateProduct = async (req, res, next) => {
    const productSchema = Joi.object({
      name: Joi.string().min(3).max(100),
      details: Joi.array().items(Joi.string()).min(2),
      price: Joi.number().min(0),
      category: Joi.string().valid("Eletrônicos", "Utilitários", "Acessórios para celular", "Acessórios para carros", "Outros"),
      stock: Joi.number().min(0),
      type: Joi.string(),
      brand: Joi.string(),
      model: Joi.string(),
      color: Joi.string(),
      images: Joi.array().items(Joi.string().uri())
    });

    try {
      const { error } = productSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const product = await Product.findById(req.params.id);
      if (!product) {
        throw new NotFound("Produto não encontrado.");
      }

      // Excluindo imagens antigas da S3 se novas imagens foram fornecidas
      if (req.body.images && req.body.images.length > 0) {
        const deletePromises = product.images.map(async (image) => {
          const key = image.url.split("/").pop();
          const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
          };
          await s3Client.send(new DeleteObjectCommand(deleteParams));
        });
        await Promise.all(deletePromises);
      }

      Object.assign(product, req.body);
      const updatedProduct = await product.save();
      res.status(200).json(updatedProduct);
    } catch (error) {
      next(error);
    }
  };

  static deleteProduct = async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        throw new NotFound("Produto não encontrado.");
      }

      // Excluindo imagens da S3
      const deletePromises = product.images.map(async (image) => {
        const key = image.url.split("/").pop();
        const deleteParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
        };
        await s3Client.send(new DeleteObjectCommand(deleteParams));
      });
      await Promise.all(deletePromises);

      await product.remove();
      res.status(200).json({ message: "Produto deletado com sucesso." });
    } catch (error) {
      next(error);
    }
  };

  static listAllProducts = async (req, res, next) => {
    try {
      const products = await Product.find();
      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  };

  static listPublicProducts = async (req, res, next) => {
    try {
      console.log("Executando listPublicProducts"); // Verificar se o método está sendo chamado
      const allProducts = await Product.find();
      console.log("Produtos encontrados:", allProducts); // Verificar se os produtos estão sendo encontrados
      res.status(200).json(allProducts);
    } catch (error) {
      console.error("Erro no listPublicProducts:", error); // Capturar e logar erros
      next(error);
    }
  };
  
}

export default ProductController;