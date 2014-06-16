var $ = require('../lib/dollar').$,
	BaseHandler = require('./BaseHandler'),
	kakuen = require('kakuen');

// inherit
function DefaultHandler(ctx) {

	BaseHandler.call(this, ctx);

	var context = ctx.getContext();

	if ($('config').ENABLE_MOCKUP) {
		this.dispatch = function() {
			kakuen.mocker(context.req, context.res, null);
		};
	} else {
		this.dispatch = function() {
			context.res.json($('errors')["ERR_NOT_FOUND"]);
		};
	}

}

$('util').inherits(BaseHandler, DefaultHandler);


module.exports = DefaultHandler;