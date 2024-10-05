import express from "express";
import Auth from "../middlewares/auth.js";
import AddressController from "../controllers/AddressController.js";

const router = express.Router();

router
  .post("/create", Auth.authenticateUser, AddressController.createAddress)
  .put("/update/:addressId", Auth.authenticateUser, AddressController.updateAddress)
  .delete("/delete/:addressId", Auth.authenticateUser, AddressController.deleteAddress)
  .get("/useraddress", Auth.authenticateUser, AddressController.getUserAddresses);

export default router;