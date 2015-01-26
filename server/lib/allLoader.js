/**
 *
 * Loader for '$' like jquery
 *
 **/

var all = require("./all").all,
  dollar = require("./dollar");

var loadDollar = function() {
  Function.prototype.bind = function() {
    var that = this,
      args = Array.prototype.slice.apply(arguments),
      scope = args.shift();

    return function() {
      return that.apply(scope, args.concat(Array.prototype.slice.apply(arguments)));
    };
  };
  dollar.lang.load(all);
};

exports.loadDollar = loadDollar;