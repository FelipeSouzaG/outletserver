import RequestError from "../erros/RequestError.js";

async function pager(req, res, next){
  try {
    let { limit = 5, page = 1, ordination = "_id: -1" } = req.query; // limite de listagem de livros por pagina
    let [orderField, order] = ordination.split(":");
    limit = parseInt(limit);
    page = parseInt(page);
    order = parseInt(order);

    const result = req.result;

    if(limit > 0 && page > 0){      
      const paginatedResult = await result.find()
        .sort({ [orderField]: order }) // filtra livros por crescente (-1 seria decrescente)
        .skip((page - 1) * limit) // filtra livros por quantidade limite por paginas
        .limit(limit) // filtra limite de livros por pagina
        .exec();

      res.status(200).json(paginatedResult);
    }else{
      next(new RequestError());
    }
  } catch (error) {
    next(error);
  }
}

export default pager;
