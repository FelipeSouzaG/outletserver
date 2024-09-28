import mongoose from "mongoose";
import "dotenv/config";

mongoose.set("strictQuery", true);

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Conectado ao MongoDB");
  } catch (error) {
    console.error("Erro de conexão com MongoDB", error);
  }
};
export default connectDB;