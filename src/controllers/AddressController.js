import NotFound from '../erros/NotFound.js';
import { Address } from '../models/Model.js';

class AddressController {
  static formatCurrency(value) {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  }

  static createAddress = async (req, res, next) => {
    try {
      const { userId } = req.userData;
      const addressData = {
        ...req.body,
        userId,
        complement: req.body.complement || '',
      };
      const address = new Address(addressData);
      await address.save();
      const formattedAddress = {
        ...address.toObject(),
        tarifa: AddressController.formatCurrency(address.tarifa),
      };
      res
        .status(201)
        .json({ address: formattedAddress, message: res.locals.message });
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
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
        complement: req.body.complement || '',
      };
      const address = await Address.findOneAndUpdate(
        { _id: addressId, userId },
        addressData,
        { new: true }
      );
      if (!address) {
        throw new NotFound('Endereço não encontrado.');
      }
      const formattedAddress = {
        ...address.toObject(),
        tarifa: AddressController.formatCurrency(address.tarifa),
      };
      res
        .status(200)
        .json({ address: formattedAddress, message: res.locals.message });
    } catch (error) {
      next(error);
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
        throw new NotFound('Endereço não encontrado.');
      }
      res.status(200).json({ message: 'Endereço removido com sucesso.' });
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
