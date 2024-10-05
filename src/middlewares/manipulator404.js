import NotFound from "../erros/NotFound.js";

function manipulator404(req, res, next){
  const error404 = new NotFound();
  next(error404);
}

export default manipulator404;