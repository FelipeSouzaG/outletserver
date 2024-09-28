import express from "express";
import UserController from "../controllers/UserController.js";
import Auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/user/register", UserController.registerUser);
router.post("/user/login", UserController.loginUser);
router.get("/user", Auth.authenticateUser, UserController.getUserData);
router.put("/user/update", Auth.authenticateUser, UserController.updateUser);
router.delete("/user/delete", Auth.authenticateUser, UserController.deleteUser);

export default router;
