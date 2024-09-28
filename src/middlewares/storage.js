import multer from "multer";
import sharp from "sharp";
import pLimit from "p-limit";

// Configuração do multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

class ImageMiddleware {
  static processImages = async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Nenhuma imagem foi enviada." });
      }

      
      const limit = pLimit(5); // Limitar a 5 processos simultâneos

      req.processedImages = await Promise.all(
        req.files.map(file => limit(async () => {
          try {
            const { originalname, buffer } = file;
            const filename = `${Date.now()}-${originalname.replace(/\.[^/.]+$/, "")}.webp`;

            const image = sharp(buffer);
            const metadata = await image.metadata();

            const targetWidth = 800;
            const targetHeight = 600;

            const originalAspectRatio = metadata.width / metadata.height;
            const targetAspectRatio = targetWidth / targetHeight;

            let resizedWidth, resizedHeight;
            if (originalAspectRatio > targetAspectRatio) {
              resizedWidth = targetWidth;
              resizedHeight = Math.round(targetWidth / originalAspectRatio);
            } else {
              resizedHeight = targetHeight;
              resizedWidth = Math.round(targetHeight * originalAspectRatio);
            }

            const extendOptions = {
              top: Math.max(0, Math.round((targetHeight - resizedHeight) / 2)),
              bottom: Math.max(0, Math.round((targetHeight - resizedHeight) / 2)),
              left: Math.max(0, Math.round((targetWidth - resizedWidth) / 2)),
              right: Math.max(0, Math.round((targetWidth - resizedWidth) / 2)),
              background: { r: 255, g: 255, b: 255, alpha: 1 },
            };

            const processedBuffer = await image
              .resize(resizedWidth, resizedHeight, {
                fit: sharp.fit.inside,
                withoutEnlargement: true,
              })
              .extend(extendOptions)
              .resize(targetWidth, targetHeight)
              .webp({ quality: 80 }) // Ajuste da qualidade
              .toBuffer();

            return { filename, buffer: processedBuffer };
          } catch (error) {
            console.error(`Erro ao processar a imagem ${file.originalname}:`, error);
            throw error;
          }
        }))
      );
      next();
    } catch (error) {
      console.error("Erro ao processar imagens:", error);
      res.status(500).json({ message: "Erro ao processar imagens." });
    }
  };
}

export { upload, ImageMiddleware };