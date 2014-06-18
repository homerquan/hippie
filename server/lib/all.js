/*
 * using this to concertrate all global vars and functions
 * For performance, only put most neccessary GLOBAL vars here
 */

/*
 *  load config and dependances
 */
var _ = require('underscore'),
	//redis = require('redis'),
	util = require('util'),
	mongoose = require('mongoose'),
	env = process.env.NODE_ENV || 'development',
	defaultConfig = require('../config/default.json'),
	logger = require('./logger.js'),
	errors = require('../var/errors.json'),
	envConfig = require('../config/' + env + '.json');

var config = _.extend(defaultConfig, envConfig);

var log = new logger({
	level: config.LOG_LEVEL,
	color: true
});

//TODO move mongose to a seperate file
mongoose.connect('mongodb://' + config.MONGODB_HOST +
	':' + config.MONGODB_PORT +
	'/' + config.MONGODB_DB);

/*
 * monitor mongo connection status
 */
var db = mongoose.connection;
db.on('error', function callback() {
	log.error("mongodb connection error !");
});
db.once('open', function callback() {
	log.info("mongodb connected.");
});

exports.all = {
	config: config,
	util: util,
	mg: mongoose,
	errors: errors,
	log: log
};