import RequestError from "./RequestError.js";

class ValidationError extends RequestError {
  constructor(error){
    const msgError = Object.values(error.errors)
      .map(error => error.message)
      .join("; ");
    super(`Erro encontrado: ${msgError}`);
  }
}

export default ValidationError;
