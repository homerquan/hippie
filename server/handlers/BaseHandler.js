// base handler module to be inherited
var $ = require('../lib/dollar').$;

function BaseHandler(ctx) {
	//put common staff such as monitor or log here
	this.get = function(context) {
		context.res.json($('errors')["ERR_NOT_FOUND"]);
	};
	this.post = function(context) {
		context.res.json($('errors')["ERR_NOT_FOUND"]);
	};
	this.put = function(context) {
		context.res.json($('errors')["ERR_NOT_FOUND"]);
	};
	this.delete = function(context) {
		context.res.json($('errors')["ERR_NOT_FOUND"]);
	};
}

module.exports = BaseHandler;