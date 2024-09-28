import user from "./userRoutes.js";
import address from "./addressRoutes.js";
import product from "./productRoutes.js";
import order from "./orderRoutes.js";
import cart from "./cartRoutes.js";
import client from "./publicRoutes.js";
import image from "./imageRoutes.js";

const routes = (app) => {
  app.route("/").get((req, res) => {
    res.status(200).send({ titulo: "Outlet Barreiro" });
  });

  app.use("/api/users", user);
  app.use("/api/addresses", address);
  app.use("/api/products", product);
  app.use("/api/orders", order);
  app.use("/api/cart", cart);
  app.use("/api/public", client);
  app.use("/api/images", image);
};

export default routes;
