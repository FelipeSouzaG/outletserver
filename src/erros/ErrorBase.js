class ErrorBase extends Error {
  constructor(msg = "Erro interno do servidor", status = 500){
    super();
    this.message = msg;
    this.status = status;
  }
  sendReply(res) {
    res.status(this.status).send({
      msg: this.message,
      status: this.status
    });
  }
}

export default ErrorBase;