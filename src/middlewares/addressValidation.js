import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

class AddressValidation {
  static formatCurrency(value) {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  }

  static validateAddress = async (req, res, next) => {
    try {
      const { street, number, district, city, state, postalCode } = req.body;
      const addressCoordinates = await this.getAddressCoordinates(
        street,
        number,
        district,
        city,
        state,
        postalCode
      );
      if (!addressCoordinates) {
        return res.status(400).json({
          message:
            'Endereço inválido ou inexistente. Verifique os dados informados.',
        });
      }
      const originCoordinates = await this.getOriginCoordinates();
      if (!originCoordinates) {
        return res.status(500).json({
          message: 'Erro ao obter cordenadas do endereço de origem.',
        });
      }
      const distance = await this.calculateRouteDistance(
        originCoordinates,
        addressCoordinates
      );
      if (distance === null) {
        return res
          .status(500)
          .json({ message: 'Erro ao calcular a distância.' });
      }
      const { tarifa, message } = this.calculateFrete(distance);
      if (tarifa === null) {
        return res.status(200).json({ message: message });
      }
      req.body.tarifa = tarifa;
      res.locals.message = message;
      next();
    } catch (error) {
      console.error('Erro na validação do endereço:', error);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  };

  static calculateFrete(distance) {
    const shipping = parseFloat(process.env.FRETE);
    const routeDistance = parseFloat(process.env.PERIMETRO);
    const routeDistanceMax = parseFloat(process.env.PERIMETRO_MAX);
    let tarifa = 0.0;
    let message = '';
    if (distance <= routeDistance) {
      message = 'Frete grátis aplicado para seu endereço!';
    } else if (distance > routeDistance && distance <= routeDistanceMax) {
      tarifa = parseFloat((distance * shipping).toFixed(2));
      message = `Frete de ${this.formatCurrency(
        tarifa
      )} será aplicado para entregar no seu endereço.`;
    } else {
      message = 'Endereço fora do perímetro de entrega da loja.';
      tarifa = null;
    }
    return { tarifa, message };
  }

  static async getOriginCoordinates() {
    try {
      const latitude = parseFloat(process.env.LATITUDE);
      const longitude = parseFloat(process.env.LONGITUDE);
      if (isNaN(latitude) || isNaN(longitude)) {
        return null;
      }
      return { lat: latitude, lng: longitude };
    } catch (error) {
      console.error('Erro ao obter coordenadas do endereço de origem:', error);
      return null;
    }
  }

  static async getAddressCoordinates(
    street,
    number,
    district,
    city,
    state,
    postalCode
  ) {
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/geocode/json',
        {
          params: {
            address: `${street} ${number}, ${district}, ${city}, ${state}, ${postalCode}`,
            key: process.env.GEO_API_KEY,
          },
        }
      );
      if (response.data.status !== 'OK' || response.data.results.length === 0) {
        return null;
      }
      const location = response.data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    } catch (error) {
      console.error('Erro ao obter coordenadas do endereço fornecido:', error);
      return null;
    }
  }

  static async calculateRouteDistance(origin, destination) {
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/directions/json',
        {
          params: {
            origin: `${origin.lat},${origin.lng}`,
            destination: `${destination.lat},${destination.lng}`,
            key: process.env.GEO_API_KEY,
          },
        }
      );
      if (response.data.status !== 'OK') {
        console.error('Erro ao calcular a rota:', response.data.status);
        return null;
      }
      const distance = response.data.routes[0].legs[0].distance.value;
      return distance / 1000;
    } catch (error) {
      console.error('Erro ao calcular a distância por rota:', error);
      return null;
    }
  }
}

export default AddressValidation;
