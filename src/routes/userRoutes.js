import express from 'express';
import UserController from '../controllers/UserController.js';
import Auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginUser);
router.get('/data', Auth.authenticateUser, UserController.getUserData);
router.put('/update', Auth.authenticateUser, UserController.updateUser);
router.delete('/delete', Auth.authenticateUser, UserController.deleteUser);

router.get(
  '/alluser',
  Auth.authenticateUser,
  Auth.authorizeAdmin,
  UserController.getAllUsers
);
router.delete(
  '/delete/:idUser',
  Auth.authenticateUser,
  Auth.authorizeAdmin,
  UserController.deleteUserAdmin
);

export default router;
