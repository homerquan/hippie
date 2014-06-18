var $ = require('../lib/dollar').$,
	BaseHandler = require('./BaseHandler'),
	DefaultHandler = require('./DefaultHandler'),
	UserStatusHandler = require('./UserStatusHandler'),
	UserConnector = require('../connectors/UserConnector');


var UserHandler = function(ctx) {

	// inherit base
	$('util').inherits(this, BaseHandler);
	BaseHandler.call(this, ctx);

	var context = ctx.getContext();

	this.connector = new UserConnector();

	this.dispatch = function() {

		// get the current step and change ctx for the next handler
		var step = ctx.shift();
		var method = ctx.getMethod();
		switch (step) {
			case '':
				this[method](context);
				break;
			case 'status':
				new UserStatusHandler(ctx).dispatch();
				break;
			default:
				new DefaultHandler(ctx).dispatch();
		}
	};

	this.get = function(context) {
		var that = this;
		this.connector.getUserById(context.req.user, function(err, data) {
			// never send sensitive data, e.g.,password to client!
			if (data && 'password' in data) {
				delete data.password;
			}
			that.send(context, err, data);
		});
	};

};


module.exports = UserHandler;