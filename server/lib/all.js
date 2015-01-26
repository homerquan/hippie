/**
 *
 * Global variable
 * Using this to concertrate all global vars and functions
 * For performance, only put most neccessary GLOBAL vars here
 *
 **/

var _ = require('underscore'),
	//redis = require('redis'),
	util = require('util'),
	mongoose = require('mongoose'),
	expressValidator = require('express-validator'),
	customValidators = require('./customValidators'),
	emailer = require('./emailer'),
	env = process.env.NODE_ENV || 'development',
	defaultConfig = require('../config/default.json'),
	winston = require('winston'),
	crypto = require('crypto'),
	base64url = require('base64url'),
	errors = require('../var/errors.json'),
	envConfig = require('../config/' + env + '.json');

var config = _.extend(defaultConfig, envConfig);

var logger = new(winston.Logger)({
	transports: [
		new(winston.transports.Console)({
			colorize: true,
			timestamp: true
		})
	]
});

mongoose.connect('mongodb://' + config.MONGODB_HOST +
	':' + config.MONGODB_PORT +
	'/' + config.MONGODB_DB);

var conn = mongoose.connection;
conn.on('error', logger.error.bind(logger, 'error in connection mongodb'));
conn.once('open', logger.info.bind(logger, 'mongodb connected'));


// custom validators for express-validator
var reqValidator = expressValidator({
	customValidators: customValidators
});

var genToken = function(size) {
	return base64url(crypto.randomBytes(size));
};

exports.all = {
	config: config,
	util: util,
	mg: mongoose,
	conn: conn,
	reqValidators: reqValidator,
	validator: expressValidator.validator, //also use native node-validator
	emailer: emailer,
	errors: errors,
	genToken: genToken,
	logger: logger
};