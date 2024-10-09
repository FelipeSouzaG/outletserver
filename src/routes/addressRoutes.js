import express from 'express';
import Auth from '../middlewares/auth.js';
import AddressValidation from '../middlewares/addressValidation.js';
import AddressController from '../controllers/AddressController.js';

const router = express.Router();

router
  .post(
    '/create',
    Auth.authenticateUser,
    AddressValidation.validateAddress,
    AddressController.createAddress
  )
  .put(
    '/update/:addressId',
    Auth.authenticateUser,
    AddressValidation.validateAddress,
    AddressController.updateAddress
  )
  .delete(
    '/delete/:addressId',
    Auth.authenticateUser,
    AddressController.deleteAddress
  )
  .get(
    '/useraddress',
    Auth.authenticateUser,
    AddressController.getUserAddresses
  );

export default router;
