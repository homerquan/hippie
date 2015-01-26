/**
 *
 * Root handler for "/" route
 * restify each path to its handler
 *
 **/

var $ = require('../lib/dollar').$,
	BaseHandler = require('./BaseHandler'),
	DefaultHandler = require('./DefaultHandler'),
	UserHandler = require('./UserHandler'),
	MeHandler = require('./MeHandler');

function RootHandler(ctx) {
	$('util').inherits(this, BaseHandler);
	BaseHandler.call(this, ctx);


	this.dispatch = function() {

		// get the current step and change ctx for the next handler
		var step = ctx.shift();
		var method = ctx.getMethod();
		switch (step) {
			case '':
				this[method](ctx.getContext());
				break;
			case 'user':
				new UserHandler(ctx).dispatch();
				break;
			case 'me':
				new MeHandler(ctx).dispatch();
				break;
			default:
				new DefaultHandler(ctx).dispatch();
		}
	};
}

module.exports = RootHandler;