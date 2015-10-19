module.exports = function(param, arrField) {
  return function(req, res, next) {
    if(req.params[param]) {
      var elems = req.body[arrField] || '[]';
      try {
        var
          parsed   = JSON.parse(elems),
          thisElem = {'id': req.params[param]};

        if(Array.isArray(parsed)) {
          parsed.push(thisElem);
        } else {
          parsed = [parsed, thisElem];
        }

        req.body[arrField] = JSON.stringify(parsed);
      } catch(e) {}
    }
    next();
  };
};
