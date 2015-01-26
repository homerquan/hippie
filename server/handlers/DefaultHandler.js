/**
 *
 * The default handler for not found route
 * - In production, this shows not found error
 * - In development, this shows mockup from kakuen
 *
 **/

var $ = require('../lib/dollar').$,
	BaseHandler = require('./BaseHandler'),
	kakuen = require('kakuen');


function DefaultHandler(ctx) {
	$('util').inherits(this, BaseHandler);
	BaseHandler.call(this, ctx);

	var context = ctx.getContext();

	if ($('config').ENABLE_MOCKUP) {
		this.dispatch = function() {
			kakuen.mocker(context.req, context.res, null);
		};
	} else {
		var that = this;
		this.dispatch = function() {
			that.send(context, $('errors')["ERR_NOT_FOUND"]);
		};
	}

}

module.exports = DefaultHandler;