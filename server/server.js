var $ = require('./lib/dollar').$,
	express = require('express'),
	bodyParser = require('body-parser'),
	errorhandler = require('errorhandler'),
	server = express();


// load common components
require('./lib/allLoader').loadDollar();

var passport = require('./lib/passport'),
	Context = require('./lib/context'),
	RootHandler = require('./handlers/RootHandler');

// oauth
server.use(passport.initialize());
server.use(passport.session());

// file uploader, limit 50mb for large image
server.use(bodyParser.json({
	limit: '50mb'
}));

server.use($('reqValidators'));

// restify handlers with middleware to check if protected and scope in oauth2
server.all(/.+/, [
	require('./lib/middleware'),
	function(req, res) {
		var ctx = new Context(req, res);
		new RootHandler(ctx).dispatch();
	}
]);

// mock and check error in dev
if ('development' === server.get('env')) {
	server.use(require('kakuen').mocker);
	server.use(require('errorhandler')({
		dumpExceptions: true,
		showStack: true
	}));
	// dump error to client
	server.use(errorhandler());
	// need this to skip error when using custom ttl cert
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
	// detect memory leaking
	var memwatch = require('memwatch');
	memwatch.on('leak', function(info) {
		console.log(info);
	});
}

server.listen($('config').PORT);
module.exports = server;
console.log('Please go to http(s)://localhost:' + $('config').PORT + ' to run hippe');
