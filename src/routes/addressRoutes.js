import express from "express";
import Auth from "../middlewares/auth.js";
import AddressController from "../controllers/AddressController.js";

const router = express.Router();

router
  .post("/user/address/create", Auth.authenticateUser, AddressController.createAddress)
  .put("/user/address/update/:addressId", Auth.authenticateUser, AddressController.updateAddress)
  .delete("/user/address/delete/:addressId", Auth.authenticateUser, AddressController.deleteAddress)
  .get("/user/addresses", Auth.authenticateUser, AddressController.getUserAddresses);

export default router;