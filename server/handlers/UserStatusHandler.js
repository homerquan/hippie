var $ = require('../lib/dollar').$,
	BaseHandler = require('./BaseHandler'),
	DefaultHandler = require('./DefaultHandler');

function UserStatusHandler(ctx) {

	BaseHandler.call(this, ctx);

	var context = ctx.getContext();

	this.dispatch = function() {
		// get the current step and change ctx for the next handler
		var step = ctx.shift();
		var method = ctx.getMethod();
		if (!step) {
			this[method](context);
		} else
			new DefaultHandler(ctx).dispatch();
	};

	this.post = function(context) {
		if (context.req.query.action === 'login') {
			// talk to auth server using resource owner's flow
			var credential = {
				'username': context.req.body.username,
				'password': context.req.body.password
			};
			$('getToken')(credential, function(err, data) {
				context.res.json(data);
			});
		} else {
			context.res.json($('errors')["ERR_NOT_FOUND"]);
		}
	};
}

$('util').inherits(BaseHandler, UserStatusHandler);
module.exports = UserStatusHandler;