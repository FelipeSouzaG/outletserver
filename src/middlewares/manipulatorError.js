import mongoose from "mongoose";
import ErrorBase from "../erros/ErrorBase.js";
import RequestError from "../erros/RequestError.js";
import ValidationError from "../erros/ValidationError.js";

function manipulatorError(error, req, res) {
  if(error instanceof mongoose.Error.CastError){
    new RequestError().sendReply(res);
  } else if(error instanceof mongoose.Error.ValidationError) {
    new ValidationError(error).sendReply(res);
  } else if(error instanceof ErrorBase){
    error.sendReply(res);
  }else {
    new ErrorBase().sendReply(res);
  }
}

export default manipulatorError;