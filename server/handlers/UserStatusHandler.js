/**
 *
 * User status handler for login/logout
 *
 **/

var _ = require('underscore'),
	$ = require('../lib/dollar').$,
	BaseHandler = require('./BaseHandler'),
	DefaultHandler = require('./DefaultHandler'),
	User = require('../models/User'),
	Verification = require('../models/Verification'),
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
		var body = '';
		res.setEncoding('utf8');
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			var data = JSON.parse(body);
			var err = null;
			if (data.error) {
				err = $('errors')['ERR_INCORRECT_LOGIN'];
				err.message = data.error_description;
			}
			cb(err, res.statusCode, data);
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

	this.dispatch = function() {
		// get the current step and change ctx for the next handler
		var step = ctx.shift();
		var method = ctx.getMethod();
		if (!step) {
			this[method](ctx.getContext());
		} else
			new DefaultHandler(ctx).dispatch();
	};

	this.post = function(context) {
		var that = this;
		var credential = {};
		var err = {};
		if (context.req.query.action === 'login') {
			// talk to auth server using resource owner's flow
			// if username use it directly, if email get user id first
			var username = context.req.body.username;
			var password = context.req.body.password;
			if ($('validator').isEmail(username)) {
				User.findByEmail(username, function(err, user) {
					credential = {
						username: user.username,
						password: password
					};
					getAccessToken(credential, function(err, statusCode, data) {
						that.send(context, err, data, statusCode, true);
					});
				});
			} else {
				credential = {
					username: username,
					password: password
				};
				getAccessToken(credential, function(err, statusCode, data) {
					that.send(context, err, data, statusCode, true);
				});
			}
		} else if (context.req.query.action === 'refresh') {
			// talk to auth server using resource owner's flow
			credential = {
				refresh_token: context.req.body.refresh_token
			};
			getAccessToken(credential, function(err, statusCode, data) {
				that.send(context, err, data, statusCode, true);
			});
		} else if (context.req.query.action === 'logout') {
			//TODO: do something such as log or remove token
			that.send(context, $('errors')['ERR_OK'], null, 200, true);
		} else if (context.req.query.action === 'reset_password') {
			context.req.checkBody('email', 'Invalid email').isEmail();
			err = context.req.validationErrors();
			if (err) {
				that.send(context, _.extend($('errors')['ERR_INVALIDE_DATA'], {
					message: "Invalid email"
				}), null, 400, true);
			} else {
				User.findByEmail(context.req.body.email, function(err, doc) {
					if (err) {
						that.send(context, $('errors')['ERR_GENERAL'], null, 400, true);
					} else {
						if (!doc) {
							that.send(context, _.extend($('errors')['ERR_NOT_FOUND'], {
								message: "The email is not found."
							}), null, 400, true);
						} else {
							User.sendPasswordReset(doc, function(err, data) {
								if (err) {
									that.send(context, $('errors')['ERR_GENERAL'], null, 400, true);
								} else {
									that.send(context, _.extend($('errors')['ERR_OK'], {
										message: "The password reset email is sent."
									}), null, 200, true);
								}
							});
						}
					}
				});
			}
		} else if (context.req.query.action === 'verify') {
			context.req.checkQuery('token', 'Invalid token').notEmpty();
			err = context.req.validationErrors();
			if (err) {
				that.send(context, _.extend($('errors')['ERR_INVALIDE_DATA'], {
					message: this.getCheckError(err)
				}), null, 400, true);
			} else {
				// update verification into used and user into verified
				Verification.findOneAndUpdate({
					token: context.req.query.token,
					userID: context.req.user,
					used: false,
					type: 'email'
				}, {
					$set: {
						used: true
					}
				}, function(err, doc) {
					if (err) {
						that.send(context, $('errors')['ERR_GENERAL'], null, 400, true);
					} else {
						if (!doc) {
							that.send(context, _.extend($('errors')['ERR_NOT_FOUND'], {
								message: "The token is not found or already used."
							}), null, 400, true);
						} else {
							User.findByIdAndUpdate(doc.userID, {
								$set: {
									verified: true
								}
							}, function(err, doc) {
								if (err) {
									that.send(context, $('errors')['ERR_GENERAL'], null, 400, true);
								} else {
									that.send(context, _.extend($('errors')['ERR_OK'], {
										message: "The user's email is verified."
									}), null, 200, true);
								}
							});
						}
					}
				});
			}
		} else if (context.req.query.action === 'check_vtoken') {
			context.req.checkBody('token', 'token is necessary').notEmpty();
			err = context.req.validationErrors();
			if (err) {
				that.send(context, _.extend($('errors')['ERR_INVALIDE_DATA'], {
					message: this.getCheckError(err)
				}), null, 400, true);
			} else {
				Verification.findOne({
					token: context.req.body.token,
					used: false
				}, function(err, doc) {
					if (err) {
						that.send(context, $('errors')['ERR_GENERAL'], null, 400, true);
					} else {
						if (doc) {
							that.send(context, _.extend($('errors')['ERR_OK'], {
								message: "The token is valid."
							}), null, 200, true);
						} else {
							that.send(context, _.extend($('errors')['ERR_NOT_FOUND'], {
								message: "The token is not find."
							}), null, 400, true);
						}
					}
				});
			}
		} else if (context.req.query.action === 'update_password') {
			context.req.checkBody('token', 'token is necessary').notEmpty();
			context.req.checkBody('password', 'password at least 6 chars').isLength(6);
			context.req.checkBody('password', 'the retyped password is not the same').equals(context.req.body.confirmPassword);
			err = context.req.validationErrors();
			if (err) {
				that.send(context, _.extend($('errors')['ERR_INVALIDE_DATA'], {
					message: this.getCheckError(err)
				}), null, 400, true);
			} else {
				Verification.findOneAndUpdate({
					token: context.req.body.token,
					used: false
				}, {
					$set: {
						used: true
					}
				}, function(err, doc) {
					if (err) {
						that.send(context, $('errors')['ERR_GENERAL'], null, 400, true);
					} else {
						if (doc) {
							User.findByIdAndUpdate(doc.userID, {
								$set: {
									password: context.req.body.password
								}
							}, function(err, doc) {
								if (err) {
									that.send(context, $('errors')['ERR_GENERAL'], null, 400, true);
								} else {
									that.send(context, _.extend($('errors')['ERR_OK'], {
										message: "The password is updated."
									}), null, 200, true);
								}
							});
						} else {
							that.send(context, _.extend($('errors')['ERR_NOT_FOUND'], {
								message: "The token is not find."
							}), null, 400, true);
						}
					}
				});
			}
		} else {
			that.send(context, _.extend($('errors')['ERR_NOT_FOUND'], {
				message: "The action is not find."
			}), null, 400, true);
		}
	};
}

module.exports = UserStatusHandler;