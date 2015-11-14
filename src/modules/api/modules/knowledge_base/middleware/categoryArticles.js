module.exports = function(req, res, next) {
  if(req.params.categoryId) {
    req.body.category = JSON.stringify({'id': req.params.categoryId});
  }

  next();
};
