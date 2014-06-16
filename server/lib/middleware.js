var $ = require('./dollar').$,
	passport = require('./passport');

/*
 * Customer middleware
 * 1. log the access
 * 2. check oauth permission and scope by external settings
 */

var logUsage = function(req, res, next) {
	//TODO: better log - async 
	console.log('%s %s %s', Date.now(), req.method, req.url);
	next();
};
var doNothing = function(req, res, next) {
	next();
};
/*
 * Check a predefined table to determain if the endpoint will skip oauth check
 * such as public user profile
 * SKIP_AUTH is used for debug in dev only
 */
var oauthCheck = function(req, res, next) {
	if ($('config').PUBLIC_ENDPOINTS[req.method][req.path] || $('config').SKIP_AUTH) {
		next();
	} else {
		passport.authenticate('bearer', {
			session: false
		})(req, res, next);
	}
};

var middleware = [logUsage, oauthCheck, doNothing];

module.exports = middleware;