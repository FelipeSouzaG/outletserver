import jwt from "jsonwebtoken";
import User from "../models/User.js";

class Auth {
  static authenticateUser = async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Token de autenticação não fornecido." });
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }
      req.userData = { userId: user._id, email: user.email, isAdmin: user.isAdmin };
      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Token inválido." });
      } else if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expirado. Faça login novamente." });
      } else {
        return res.status(500).json({ message: "Erro na autenticação.", error: error.message });
      }
    }
  };

  static authorizeAdmin = (req, res, next) => {
    if (!req.userData.isAdmin) {
      return res.status(403).json({ message: "Acesso negado. Administradores somente." });
    }
    next();
  };
}

export default Auth;