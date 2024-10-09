import ErrorBase from "./ErrorBase.js";

class NotFound extends ErrorBase {
  constructor(msg = "Página não encontrada."){
    super(msg, 404);
  }
}

export default NotFound;