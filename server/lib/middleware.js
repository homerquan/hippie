var $ = require('./dollar').$,
	_ = require('underscore'),
	passport = require('./passport');

/*
 * Customer middleware
 * 1. log the access
 * 2. check oauth permission and scope by external settings
 * 3. content type negotiation
 */
var logUsage = function(req, res, next) {
	$('logger').log('%s %s %s', Date.now(), req.method, req.url);
	next();
};
var doNothing = function(req, res, next) {
	next();
};
/* 
 * Check the Content-Type for security reason
 * Default is json, decline other types and response error in html
 * allow multipart/form-data for upload only
 */
var contentTypeNegotiation = function(req, res, next) {
	if (req.header('content-type') && req.url.lastIndexOf('/file', 0) === 0 && req.header('content-type').lastIndexOf('multipart/form-data', 0) === 0) {
		next();
	} else if (req.header('content-type') && req.url.lastIndexOf('/image', 0) === 0 && req.header('content-type').lastIndexOf('application/x-www-form-urlencoded', 0) === 0) {
		next();
	} else if (req.header('content-type') && req.header('content-type').indexOf('application/json') === -1) {
		next("The content type is not supported.");
	} else {
		next();
	}
};

/**
 * Check object B is part of object A by properties
 * @param  {object}  objA
 * @param  {object}  objB
 * @return {Boolean}
 */
var isPartOf = function(objA, objB) {
	return _.keys(objB).map(function(key) {
		return objB[key] === objA[key];
	}).reduce(function(prev, curr) {
		return prev && curr;
	});
};

/*
 * Check if a path matchs the skip list
 */
var checkConfig = function(config, path, query) {
	return _.find(config, function(rule) {
		var result = false;
		if (typeof rule === "object") {
			result = path.match(new RegExp(rule.path, "i")) && isPartOf(query, rule.query);
		} else {
			result = path.match(new RegExp(rule, "i"));
		}
		return result;
	});
};
/*
 * Check a predefined table to determain if the endpoint will skip oauth check
 * such as public user profile
 * SKIP_AUTH is used for debugging in development only
 */
var oauthCheck = function(req, res, next) {
	if (checkConfig($('config').PUBLIC_ENDPOINTS[req.method], req.path, req.query) || $('config').SKIP_AUTH) {
		//overwrite user by ?mock_user=<id> for developing only
		req.user = req.query.mock_user || '';
		next();
	} else {
		passport.authenticate('bearer', {
			session: false
		})(req, res, next);
	}
};

var middleware = [logUsage, oauthCheck, contentTypeNegotiation, doNothing];
module.exports = middleware;