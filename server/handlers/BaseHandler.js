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
	this.send = function(context, err, data, statusCode) {
		//set default statusCode 200
		if (!statusCode) {
			statusCode = 200;
		}
		if (!err && statusCode === 200) {
			context.res.json(200, data);
		} else {
			var error = $('errors')["ERR_GENERAL"];
			if ($('config').DUMP_ERROR_TO_CLIENT)
				error.dump = err;
			context.res.json(statusCode || 400, error);
		}
	}
}

module.exports = BaseHandler;