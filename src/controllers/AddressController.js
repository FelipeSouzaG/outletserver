import NotFound from "../erros/NotFound.js";
import { Address } from "../models/Model.js";

class AddressController {

  static createAddress = async (req, res, next) => {
    try {
      const { userId } = req.userData;
      const addressData = {
        ...req.body,
        userId,
        complement: req.body.complement || ""
      };

      const address = new Address(addressData);
      await address.save();

      res.status(201).json({ 
        address, 
        message: "Endereço de entrega cadastrado com sucesso." 
      });
    } catch (error) {
      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ errors });
      } else {
        next(error);
      }
    }
  };

  static updateAddress = async (req, res, next) => {
    try {
      const { addressId } = req.params;
      const { userId } = req.userData;
      const addressData = {
        ...req.body,
        userId,
        complement: req.body.complement || ""
      };
      const address = await Address.findOneAndUpdate(
        { _id: addressId, userId },
        addressData,
        { new: true }
      );
      if (!address) {
        throw new NotFound("Endereço não encontrado.");
      }

      res.status(200).json({ 
        address, 
        message: "Endereço de entrega alterado com sucesso." 
      });
    } catch (error) {
      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ errors });
      } else if (error instanceof NotFound) {
        return res.status(404).json({ message: error.message });
      } else {
        next(error);
      }
    }
  };

  static deleteAddress = async (req, res, next) => {
    try {
      const { addressId } = req.params;
      const { userId } = req.userData;
      const address = await Address.findOneAndDelete({
        _id: addressId,
        userId,
      });
      if (!address) {
        throw new NotFound("Endereço não encontrado.");
      }
      res.status(200).json({ message: "Endereço removido com sucesso." });
    } catch (error) {
      next(error);
    }
  };

  static getUserAddresses = async (req, res, next) => {
    try {
      const { userId } = req.userData;
      const addresses = await Address.find({ userId });
      res.status(200).json(addresses);
    } catch (error) {
      next(error);
    }
  };
}

export default AddressController;