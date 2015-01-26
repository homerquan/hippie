/**
 *
 * User's own profile handler
 *
 **/

var $ = require('../lib/dollar').$,
	BaseHandler = require('./BaseHandler'),
	DefaultHandler = require('./DefaultHandler'),
	UserStatusHandler = require('./UserStatusHandler'),
	User = require('../models/User');


var MeHandler = function(ctx) {

	// inherit base
	$('util').inherits(this, BaseHandler);
	BaseHandler.call(this, ctx);

	//put common staff such as monitor or log here
	this.dispatch = function() {
		// get the current step and change ctx for the next handler
		var step = ctx.shift();
		var method = ctx.getMethod();
		switch (step) {
			case '':
				this[method](ctx.getContext());
				break;
			default:
				new DefaultHandler(ctx).dispatch();
		}
	};

	this.get = function(context) {
		var that = this;
		var id = context.req.user;
		User.findById(id)
			.populate({
				path: 'profile',
				select: '-_id',
			})
			.exec(function(err, data) {
				// never send sensitive data, e.g.,password to client!
				if (data && 'password' in data) {
					delete data.password;
				}
				that.send(context, err, data);
			});
	};

};


module.exports = MeHandler;