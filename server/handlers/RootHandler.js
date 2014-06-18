var $ = require('../lib/dollar').$,
	BaseHandler = require('./BaseHandler'),
	DefaultHandler = require('./DefaultHandler'),
	UserHandler = require('./UserHandler');

// inherit
function RootHandler(ctx) {
	$('util').inherits(this, BaseHandler);
	BaseHandler.call(this, ctx);

	var context = ctx.getContext();

	this.dispatch = function() {

		// get the current step and change ctx for the next handler
		var step = ctx.shift();

		switch (step) {
			case 'user':
				new UserHandler(ctx).dispatch();
				break;
			default:
				new DefaultHandler(ctx).dispatch();
		};
	};

};



module.exports = RootHandler;