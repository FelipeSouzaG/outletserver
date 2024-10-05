import NotFound from "../erros/NotFound.js";
import { User, Address, Order, Cart } from "../models/Model.js";

class UserController {

  static registerUser = async (req, res, next) => {
    try {
      const newUser = new User(req.body);
      const user = await newUser.save();
      res.status(201).json(user);
    } catch (error) {
      if (error.code === 11000) {
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

      if (name) {
        user.name = name;
      }

      if (email) {
        user.email = email;
      }

      if (password) {
        user.password = password;
      }

      await user.save();

      res.status(200).json({ message: "Dados do usuário atualizados." });
    } catch (error) {
      if (error.code === 11000) {
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

     await Promise.all([
       Address.deleteMany({ userId }),
       Cart.deleteMany({ userId }),
       Order.deleteMany({ userId })
     ]);
 
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

  static getAllUsers = async (req, res, next) => {
   try {
     const users = await User.find();
     res.status(200).json(users);
   } catch (error) {
     next(error);
   }
 };

 static deleteUserAdmin = async (req, res, next) => {
  try {
    const { idUser } = req.params;

    const user = await User.findById(idUser);
    if (!user) {
      throw new NotFound("Usuário não encontrado.");
    }

    await Promise.all([
      Address.deleteMany({ userId: idUser }),
      Cart.deleteMany({ userId: idUser }),
      Order.deleteMany({ userId: idUser })
    ]);

    await user.remove();
    res.status(200).json({ message: "Usuário removido com sucesso." });
  } catch (error) {
    next(error);
  }
};
  
}

export default UserController;
