import ErrorBase from "./ErrorBase.js";

class RequestError extends ErrorBase {
  constructor(msg = "Um ou mais dados estão incorretos"){
    super(msg, 400);
  }
}

export default RequestError;