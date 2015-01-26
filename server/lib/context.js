/**
 *
 * Route context include req, res, restful path, and parsed params
 *
 **/

var $ = require('./dollar').$;

var Context = function(req, res) {

  var ctx = {
    req: req,
    res: res,
    params: {},
    tokens: []
  };

  // Resource name has to start with a char
  var resGuide = function(str) {
    return /^[A-Za-z]\w*$/.test(str);
  };

  // resource value/id has to be a mongo objectid
  var valGuide = function(str) {
    return $('validator').isMongoId(str);
  };

  var parse = function(url) {
    var parts = url.split("?") || [],
      path = parts[0] || "",
      tokens = path.split("/") || [];
    tokens.splice(0, 1);
    return tokens;
  };

  ctx.tokens = parse(req.url);

  this.getContext = function() {
    return ctx;
  };

  this.getMethod = function() {
    return ctx.req.method.toLowerCase();
  };

  this.getPath = function() {
    return ctx.req._parsedUrl.path;
  };

  this.shift = function() {
    var resName = "",
      resValue = "",
      shiftCount = 0;
    if (resGuide(ctx.tokens[0])) {
      resName = ctx.tokens[0];
      shiftCount++;
      if (valGuide(ctx.tokens[1])) {
        val = ctx.tokens[1];
        shiftCount++;
        ctx.params[resName] = val;
        //TODO: ctx.order.push(resName);
      } else {
        ctx.params[resName] = null;
      }
    }
    var step = ctx.tokens[0] || "";
    ctx.tokens.splice(0, shiftCount);
    return step;
  };

};

module.exports = Context;