import NotFound from "../erros/NotFound.js";
import { User } from "../models/Model.js";

class UserController {

  static registerUser = async (req, res, next) => {
    try {
      const newUser = new User(req.body);
      const user = await newUser.save();
      res.status(201).json(user);
    } catch (error) {
      if (error.code === 11000) { // Código de erro para duplicidade de chave em MongoDB
        res.status(409).json({ message: "E-mail já cadastrado. Por favor, use outro e-mail." });
      } else {
        next(error);
      }
    }
  };

  static updateUser = async (req, res, next) => {
    try {
      const { userId } = req.userData;
      const { name, email, password } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        throw new NotFound("Id de usuário não encontrado.");
      }

      // Atualiza o nome se fornecido
      if (name) {
        user.name = name;
      }

      // Atualiza o email se fornecido
      if (email) {
        user.email = email;
      }

      // Atualiza a senha se fornecida
      if (password) {
        user.password = password; // Lembre-se de aplicar as devidas verificações e criptografia de senha
      }

      await user.save();

      res.status(200).json({ message: "Dados do usuário atualizados." });
    } catch (error) {
      if (error.code === 11000) { // Código de erro para duplicidade de chave em MongoDB
        res.status(409).json({ message: "E-mail já cadastrado. Por favor, use outro e-mail." });
      } else {
        next(error);
      }
    }
  };

  static loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
      const token = await User.login(email, password);
      res.status(200).json({ token });
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  };

  static deleteUser = async (req, res, next) => {
    try {
      const { userId } = req.userData;

      const user = await User.findById(userId);
      if (!user) {
        throw new NotFound("Usuário não encontrado.");
      }

      await user.remove();
      res.status(200).json({ message: "Usuário removido com sucesso." });
    } catch (error) {
      next(error);
    }
  };

  static getUserData = async (req, res, next) => {
    try {
      const { userId } = req.userData;

      const user = await User.findById(userId);
      if (!user) {
        throw new NotFound("Usuário não encontrado.");
      }

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };
  
}

export default UserController;
