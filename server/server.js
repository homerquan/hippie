var $ = require('./lib/dollar').$,
	express = require('express'),
	server = express();

// load common components
require('./lib/allLoader').loadDollar();

var passport = require('./lib/passport'),
	Context = require('./lib/context'),
	RootHandler = require('./handlers/RootHandler');

// oauth
server.use(require('body-parser')());
server.use(passport.initialize());
server.use(passport.session());

// restify handlers with middleware to check if protected and scope in oauth2
server.all(/.+/, [
	require('./lib/middleware'),
	function(req, res) {
		var ctx = new Context(req, res);
		new RootHandler(ctx).dispatch();
	}
]);

// mock and check error in dev
if ('development' == server.get('env')) {
	server.use(require('kakuen').mocker);
	server.use(require('errorhandler')({
		dumpExceptions: true,
		showStack: true
	}));
	// need this to skip error when using custom ttl cert
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

server.listen($('config').PORT);
console.log('Please go to http://localhost:' + $('config').PORT + ' to run Whitetiger BE');