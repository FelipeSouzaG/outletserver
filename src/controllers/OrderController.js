import { Order, Cart, Product } from "../models/Model.js";
import NotFound from "../erros/NotFound.js";
import qrcode from "qrcode";
import crc from "crc";

class OrderController {
  // Função para gerar a string PIX
  static generatePixString = async (order) => {
    let pixString = "000201"; // Payload Format Indicator
    pixString += "010211"; // Point of Initiation Method (Estático)

    // Merchant Account Information
    const pixKey = "+5531995454632"; // Substitua pela chave PIX válida
    const pixKeyLength = pixKey.length.toString().padStart(2, "0");
    pixString += `26${(22 + pixKey.length).toString().padStart(2, "0")}`; // ID + tamanho subsequente
    pixString += `0014br.gov.bcb.pix01${pixKeyLength}${pixKey}`;

    // Merchant Category Code
    pixString += "52040000"; // Código do comércio (0000 se não categorizado)

    // Transaction Currency
    pixString += "5303986"; // BRL

    // Valor da Transação
    let amount = (order.total).toFixed(2); // Format the amount
    
    pixString += `54${amount.length.toString().padStart(2, "0")}${amount}`;
    

    // Country Code
    pixString += "5802BR"; // Código do país

    // Merchant Name
    const merchantName = "FELIPE DE SOUZA GALVAO"; // Nome do lojista
    pixString += `59${merchantName.length.toString().padStart(2, "0")}${merchantName}`;

    // Merchant City
    const receiverCity = "BELO HORIZONT";
    pixString += `60${receiverCity.length.toString().padStart(2, "0")}${receiverCity}`;

    // Additional Data Field Template (ID da transação)
    const txid = order.orderNumber; // Utilize o número do pedido como TXID
    pixString += `62${(4 + txid.length).toString().padStart(2, "0")}`; // ID + tamanho subsequente
    pixString += `05${txid.length.toString().padStart(2, "0")}${txid}`;

    // Adiciona o campo de CRC16
    pixString += "6304";

    // Calcula o CRC16 (usando crc16ccitt)
    const crc16 = crc.crc16ccitt(Buffer.from(pixString, "utf8")).toString(16).toUpperCase(); 
    pixString += crc16.padStart(4, "0"); // Certifique-se de que o CRC16 tem 4 dígitos

    return pixString;
  };
 
  static registerOrder = async (req, res, next) => {    
    try {
      const userId = req.userData.userId;
      const cart = await Cart.findOne({ user: userId }).populate("items.product");

 
      if (!cart || cart.items.length === 0) {
        throw new Error("Carrinho vazio. Adicione itens ao carrinho.");
      }
 
      const total = cart.items.reduce((sum, item) => {
        return sum + item.product.price * item.quantity;
      }, 0);
 
      const orderItems = cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      }));
 
      const orderNumber = await OrderController.generateOrderNumber();
      const newOrder = new Order({ 
        user: userId, 
        products: orderItems, 
        total: total,
        orderNumber: orderNumber
      });
 
      const order = await newOrder.save();

      
 
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.product, { 
          $inc: { stock: -item.quantity } 
        });
      }

     
 
      // Gerar String PIX
      const pixString = await OrderController.generatePixString(order);
      

      // Gerar QR Code a partir da String PIX
      const qrCode = await qrcode.toDataURL(pixString);

     
 
      await Cart.findOneAndDelete({ user: userId });
      res.status(201).json({ 
        order: order, 
        qrCode: qrCode,
        message: "Pedido realizado com sucesso! Aguardando pagamento via Pix." 
      });
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({ message: error.message });
      } else {
        next(error); 
      }
    }
  };
 
  // Método para gerar o número de pedido
  static generateOrderNumber = async () => {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const firstDayOfMonth = new Date(`${year}-${month}-01`);
      const firstDayOfNextMonth = new Date(firstDayOfMonth);
      firstDayOfNextMonth.setMonth(firstDayOfMonth.getMonth() + 1);
      const lastOrder = await Order.findOne({
        createdAt: { $gte: firstDayOfMonth, $lt: firstDayOfNextMonth }
      }).sort({ createdAt: -1 });
      let sequence = 1;
      if (lastOrder && lastOrder.orderNumber) {
        const lastOrderNumber = lastOrder.orderNumber;
        const lastSequence = parseInt(lastOrderNumber.slice(-4), 10);
        sequence = lastSequence + 1;
      }
 
      const sequenceString = ("0000" + sequence).slice(-4);
      const orderNumber = `${year}${month}${sequenceString}`;
      return orderNumber;
    } catch (error) {
      console.error("Erro ao gerar número do pedido:", error);
      throw error;
    }
  };


  
  /*static registerOrder = async (req, res, next) => {
    
    try {
      const userId = req.userData.userId;
      const cart = await Cart.findOne({ user: userId }).populate("items.product");

      if (!cart || cart.items.length === 0) {
        throw new Error("Carrinho vazio. Adicione itens ao carrinho.");
      }
      const total = cart.items.reduce((sum, item) => {
        return sum + item.product.price * item.quantity;
      }, 0);
      const orderItems = cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      }));
      const orderNumber = await OrderController.generateOrderNumber();
      const newOrder = new Order({ 
        user: userId, 
        products: orderItems, 
        total: total,
        orderNumber: orderNumber
      });
      const order = await newOrder.save();
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.product, { 
          $inc: { stock: -item.quantity } 
        });
      }
      const qrCode = await qrcode.toDataURL(process.env.KEY);
      await Cart.findOneAndDelete({ user: userId });
      res.status(201).json({ 
        order: order, 
        qrCode: qrCode,
        message: "Pedido realizado com sucesso! Aguardando pagamento via Pix." 
      });
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({ message: error.message });
      } else {
        next(error); 
      }
    }
  };
  

  // Método para gerar o número de pedido
  static generateOrderNumber = async () => {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const firstDayOfMonth = new Date(`${year}-${month}-01`);
      const firstDayOfNextMonth = new Date(firstDayOfMonth);
      firstDayOfNextMonth.setMonth(firstDayOfMonth.getMonth() + 1);
      const lastOrder = await Order.findOne({
        createdAt: { $gte: firstDayOfMonth, $lt: firstDayOfNextMonth }
      }).sort({ createdAt: -1 });
      let sequence = 1;
      if (lastOrder && lastOrder.orderNumber) {
        const lastOrderNumber = lastOrder.orderNumber;
        const lastSequence = parseInt(lastOrderNumber.slice(-4), 10);
        sequence = lastSequence + 1;
      }
  
      const sequenceString = ("0000" + sequence).slice(-4);
      const orderNumber = `${year}${month}${sequenceString}`;
      return orderNumber;
    } catch (error) {
      console.error("Erro ao gerar número do pedido:", error);
      throw error;
    }
  };
  */
  static getOrder = async (req, res, next) => {
    try {
      const orderId = req.params.orderId;
      const order = await Order.findById(orderId)
        .populate("user")
        .populate("products.product");
      if (!order) {
        throw new NotFound("Pedido não encontrado.");
      }
      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  };

  static updateOrder = async (req, res, next) => {
    try {
      const orderId = req.params.orderId;
      const updatedData = req.body;
      if (updatedData.products) {
        const originalOrder = await Order.findById(orderId).populate("products.product");
        for (let i = 0; i < updatedData.products.length; i++) {
          const updatedItem = updatedData.products[i];
          const originalItem = originalOrder.products[i];
          if (updatedItem.quantity !== originalItem.quantity) {
            const quantityDifference = updatedItem.quantity - originalItem.quantity;
            await Product.findByIdAndUpdate(updatedItem.product, { 
              $inc: { stock: -quantityDifference } 
            });
          }
        }
      }

      const order = await Order.findByIdAndUpdate(orderId, updatedData, { new: true });
      if (!order) {
        throw new NotFound("Pedido não encontrado.");
      }
      res.status(200).json(order);
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({ message: error.message });
      } else {
        next(error); 
      }
    }
  };

  static deleteOrder = async (req, res, next) => {
    try {
      const orderId = req.params.orderId;
      const order = await Order.findByIdAndDelete(orderId).populate("products.product");
      if (!order) {
        throw new NotFound("Pedido não encontrado.");
      }
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.product, { 
          $inc: { stock: item.quantity } 
        });
      }
      res.status(200).json({ message: "Pedido removido com sucesso." });
    } catch (error) {
      next(error);
    }
  };

  static listAllOrders = async (req, res, next) => {
    try {
      const allOrders = await Order.find()
        .populate("user")
        .populate("products.product");
      res.status(200).json(allOrders);
    } catch (error) {
      next(error);
    }
  };

  static updateOrderStatus = async (req, res, next) => {
    try {
      const orderId = req.params.orderId;
      const { status } = req.body;
      if (!["pendente pagamento", "pedido em entrega", "finalizado"].includes(status)) {
        return res.status(400).json({ message: "Status inválido." });
      }

      const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
      
      if (!order) {
        throw new NotFound("Pedido não encontrado.");
      }

      res.status(200).json({ order, message: "Status do pedido atualizado." });
    } catch (error) {
      next(error);
    }
  };
}

export default OrderController;