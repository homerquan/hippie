/**
 *
 * User handler
 *
 **/


var $ = require('../lib/dollar').$,
	BaseHandler = require('./BaseHandler'),
	DefaultHandler = require('./DefaultHandler'),
	UserStatusHandler = require('./UserStatusHandler'),
	User = require('../models/User');


var UserHandler = function(ctx) {

	// inherit base
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
			case 'status':
				new UserStatusHandler(ctx).dispatch();
				break;
			default:
				new DefaultHandler(ctx).dispatch();
		}
	};

	this.get = function(context) {
		var that = this;
		if (!context.params.user) {
			that.send(context, $('errors')["ERR_MISSING_FIELD"]);
		} else {
			User.findById(context.params.user, function(err, data) {
				// never send sensitive data, e.g.,password to client!
				if (data && 'password' in data) {
					delete data.password;
				}
				that.send(context, err, data);
			});
		}
	};

	this.post = function(context) {
		var that = this;
		var user = new User(context.req.body);
		user.save(function(err, data) {
			that.send(context, err, data);
		});
	};

};


module.exports = UserHandler;