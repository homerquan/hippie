var $ = require('../lib/dollar').$,
	BaseHandler = require('./BaseHandler'),
	DefaultHandler = require('./DefaultHandler'),
	https = require('https');

//forward credential to oauth server with client info
var getAccessToken = function(data, cb) {
	var options = {
		method: 'POST',
		host: $('config').AUTH_HOST,
		port: $('config').AUTH_PORT,
		headers: {
			'Content-Type': 'application/json',
			'authorization': 'Basic ' + new Buffer($('config').OAUTH_CLIENT_ID + ':' + $('config').OAUTH_CLIENT_SECRET).toString('base64')
		},
		path: '/oauth/token'
	};
	var req = https.request(options, function(res) {
		var body = "";
		res.setEncoding('utf8');
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on("end", function() {
			cb(null, res.statusCode, JSON.parse(body));
		});
	});
	if (data) {
		// if refreshToken flow, add one
		// if oauth2 resource owner flow, add two extra fields
		if (data.refresh_token) {
			data.grant_type = 'refresh_token';
		} else {
			data.grant_type = 'password';
			data.scope = 'offline_access';
		}
		req.write(JSON.stringify(data));
	}
	req.end();
	req.on('error', function(e) {
		cb(e, 400, null);
	});
};


function UserStatusHandler(ctx) {

	$('util').inherits(this, BaseHandler);
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
		var that = this;
		if (context.req.query.action === 'login') {
			// talk to auth server using resource owner's flow
			var credential = {
				username: context.req.body.username,
				password: context.req.body.password
			};
			getAccessToken(credential, function(err, statusCode, data) {
				that.send(context, err, data, statusCode);
			});
		} else if (context.req.query.action === 'refresh') {
			// talk to auth server using resource owner's flow
			var credential = {
				refresh_token: context.req.body.refresh_token
			};
			getAccessToken(credential, function(err, statusCode, data) {
				that.send(context, err, data, statusCode);
			});
		} else if (context.req.query.action === 'logout') {
			//remove token here
			context.res.json(200, $('errors')["ERR_OK"]);
		} else {
			context.res.json(400, $('errors')["ERR_NOT_FOUND"]);
		}
	};
}

module.exports = UserStatusHandler;