import user from "./userRoutes.js";
import address from "./addressRoutes.js";
import product from "./productRoutes.js";
import order from "./orderRoutes.js";
import cart from "./cartRoutes.js";
import client from "./publicRoutes.js";

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
};

export default routes;
