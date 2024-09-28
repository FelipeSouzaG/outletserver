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

class ImageController {
  static async uploadImagesToS3(req, res) {
    const { processedImages } = req;

    try {
      const uploadedUrls = await Promise.all(
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

      res.status(200).json({ urls: uploadedUrls });
    } catch (error) {
      console.error("Erro ao fazer upload das imagens:", error);
      res
        .status(500)
        .json({ message: "Erro ao fazer upload das imagens", error: error.message });
    }
  }
}

export default ImageController;