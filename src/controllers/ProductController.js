import { Product } from "../models/Model.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
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
    const { name, details, price, category, stock, type, brand, model, color } = req.body;
    const { processedImages } = req;

    try {
      const imageUrls = await Promise.all(
        processedImages.map(async (image) => {
          const { filename, buffer } = image;
          const key = `${uuidv4()}-${filename}`;

          const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: "image/webp",
          };

          await s3Client.send(new PutObjectCommand(params));
          return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        })
      );

      const newProduct = new Product({
        name,
        details: details.split(','),
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

      res.status(201).json({ message: "Produto criado com sucesso!", product: newProduct });
    } catch (error) {
      console.error("Erro ao criar o produto:", error);
      res.status(500).json({ message: "Erro ao criar o produto.", error: error.message });
    }
  }
}

export default ProductController;
